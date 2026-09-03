<?php

namespace App\Http\Controllers;

use App\Models\{Exam, ExamMark, Guardian, Invoice, ParentConsent, Payment, Student};
use App\Services\SmsService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Cache, DB, RateLimiter};

class GuardianPortalController extends Controller
{
    private function guardian(Request $request): Guardian
    {
        $guardian = $request->user()->guardian;
        abort_unless($guardian, 403, 'A linked guardian account is required.');
        return $guardian;
    }

    private function student(Request $request, int $id): Student
    {
        $guardian = $this->guardian($request);
        return Student::where('id', $id)->where(fn ($query) => $query->where('guardian_id', $guardian->id)->orWhereHas('guardians', fn ($linked) => $linked->where('guardians.id', $guardian->id)))->firstOrFail();
    }

    public function sendOtp(Request $request)
    {
        $guardian = $this->guardian($request);
        $phone = $guardian->father_phone ?: $guardian->mother_phone;
        abort_unless($phone, 422, 'Guardian phone is missing.');
        $key = 'guardian-otp-send:'.$guardian->id;
        abort_if(RateLimiter::tooManyAttempts($key, 3), 429, 'Too many OTP requests. Try again in '.RateLimiter::availableIn($key).' seconds.');
        RateLimiter::hit($key, 600);
        $otp = (string) random_int(100000, 999999);
        Cache::put('guardian-otp:'.$guardian->id, ['hash' => hash('sha256', $otp), 'phone_hash' => hash('sha256', $phone), 'attempts' => 0], now()->addMinutes(5));
        abort_unless(SmsService::send($phone, "Your school guardian verification code is {$otp}. It expires in 5 minutes.", ['campus_id' => $guardian->campus_id, 'recipient_type' => 'guardian', 'recipient_id' => $guardian->id, 'category' => 'verification', 'reference_key' => 'guardian-otp:'.$guardian->id.':'.now()->timestamp, 'sent_by' => $request->user()->id]), 503, 'OTP could not be sent. Please try again.');
        return back()->with('success', 'Verification code sent.');
    }

    public function verifyOtp(Request $request)
    {
        $guardian = $this->guardian($request);
        $data = $request->validate(['otp' => 'required|digits:6']);
        $cacheKey = 'guardian-otp:'.$guardian->id;
        $record = Cache::get($cacheKey);
        abort_unless(is_array($record), 422, 'Invalid or expired verification code.');
        $phone = $guardian->father_phone ?: $guardian->mother_phone;
        abort_unless(hash_equals($record['phone_hash'], hash('sha256', (string) $phone)), 422, 'Phone number changed. Request a new code.');
        $record['attempts'] = (int) ($record['attempts'] ?? 0) + 1;
        if ($record['attempts'] >= 5) { Cache::forget($cacheKey); abort(429, 'Too many invalid attempts. Request a new code.'); }
        Cache::put($cacheKey, $record, now()->addMinutes(5));
        abort_unless(hash_equals($record['hash'], hash('sha256', $data['otp'])), 422, 'Invalid or expired verification code.');
        Cache::forget($cacheKey);
        RateLimiter::clear('guardian-otp-send:'.$guardian->id);
        $guardian->update(['phone_verified_at' => now()]);
        $this->timeline($guardian, null, 'system', 'Phone verified', 'Guardian phone verification completed.');
        return back()->with('success', 'Phone verified.');
    }

    public function preferences(Request $request)
    {
        $guardian = $this->guardian($request);
        $data = $request->validate(['sms' => 'required|boolean', 'email' => 'required|boolean', 'push' => 'required|boolean', 'attendance' => 'required|boolean', 'results' => 'required|boolean', 'fees' => 'required|boolean', 'emergency_contact_name' => 'nullable|string|max:255', 'emergency_contact_phone' => 'nullable|string|max:30', 'emergency_priority' => 'required|integer|min:1|max:10']);
        $guardian->update(['notification_preferences' => collect($data)->only(['sms', 'email', 'push', 'attendance', 'results', 'fees'])->all(), 'emergency_contact_name' => $data['emergency_contact_name'] ?? null, 'emergency_contact_phone' => $data['emergency_contact_phone'] ?? null, 'emergency_priority' => $data['emergency_priority']]);
        return back()->with('success', 'Notification and emergency preferences saved.');
    }

    public function consent(Request $request, ParentConsent $consent)
    {
        $guardian = $this->guardian($request);
        abort_unless($consent->guardian_id === $guardian->id, 404);
        abort_if($consent->expires_at && $consent->expires_at->isPast(), 422, 'This consent request has expired.');
        $data = $request->validate(['is_granted' => 'required|boolean', 'signature_name' => 'required|string|max:255']);
        $consent->update($data + ['ip_address' => $request->ip(), 'responded_at' => now()]);
        $this->timeline($guardian, $consent->student_id, 'consent', 'Consent response', ($data['is_granted'] ? 'Granted: ' : 'Declined: ').$consent->title);
        return back()->with('success', 'Consent response recorded.');
    }

    public function subscribe(Request $request)
    {
        $guardian = $this->guardian($request);
        $data = $request->validate(['endpoint' => 'required|url|max:2000', 'public_key' => 'nullable|string|max:1000', 'auth_token' => 'nullable|string|max:1000', 'device_name' => 'nullable|string|max:255']);
        $hash = hash('sha256', $data['endpoint']);
        DB::table('push_subscriptions')->updateOrInsert(['user_id' => $request->user()->id, 'endpoint_hash' => $hash], $data + ['last_used_at' => now(), 'created_at' => now(), 'updated_at' => now()]);
        $preferences = $guardian->notification_preferences ?? [];
        $preferences['push'] = true;
        $guardian->update(['notification_preferences' => $preferences]);
        return response()->json(['saved' => true]);
    }

    public function statement(Request $request)
    {
        $guardian = $this->guardian($request); $children = $this->children($guardian);
        $invoices = Invoice::with('student')->whereIn('student_id', $children->pluck('id'))->get();
        return Pdf::loadView('pdf.guardian-statement', ['g' => $guardian, 'children' => $children, 'invoices' => $invoices])->download('family-statement-'.now()->format('Ymd').'.pdf');
    }

    public function receipt(Request $request, int $payment)
    {
        $record = Payment::with('student')->findOrFail($payment); $this->student($request, $record->student_id);
        return Pdf::loadView('pdf.fee-receipt', ['payment' => $record])->download('receipt-'.$record->id.'.pdf');
    }

    public function reportCard(Request $request, int $student, int $exam)
    {
        $record = $this->student($request, $student); $publishedExam = Exam::where('id', $exam)->where('results_published', true)->firstOrFail();
        $marks = ExamMark::with('subject')->where('student_id', $record->id)->where('exam_id', $publishedExam->id)->get();
        return Pdf::loadView('pdf.report-card', ['s' => $record, 'e' => $publishedExam, 'marks' => $marks])->download("report-card-{$record->admission_no}.pdf");
    }

    public function transcript(Request $request, int $student)
    {
        $record = $this->student($request, $student);
        $marks = ExamMark::with(['subject', 'exam'])->where('student_id', $record->id)->whereHas('exam', fn ($query) => $query->where('results_published', true))->get()->groupBy('exam_id');
        return Pdf::loadView('pdf.student-transcript', ['student' => $record, 'marksByExam' => $marks])->download("transcript-{$record->admission_no}.pdf");
    }

    private function children(Guardian $guardian)
    {
        return Student::where(fn ($query) => $query->where('guardian_id', $guardian->id)->orWhereHas('guardians', fn ($linked) => $linked->where('guardians.id', $guardian->id)))->get();
    }

    private function timeline(Guardian $guardian, ?int $studentId, string $channel, string $subject, string $content): void
    {
        DB::table('guardian_communication_events')->insert(['guardian_id' => $guardian->id, 'student_id' => $studentId, 'channel' => $channel, 'direction' => 'inbound', 'subject' => $subject, 'content' => $content, 'status' => 'recorded', 'created_at' => now(), 'updated_at' => now()]);
    }
}
