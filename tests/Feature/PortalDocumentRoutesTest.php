<?php

namespace Tests\Feature;

use App\Models\{Campus, Exam, ExamMark, Guardian, Payment, Student, Subject, User};
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class PortalDocumentRoutesTest extends TestCase
{
    use RefreshDatabase;

    public function test_receipt_is_bound_to_the_linked_student_and_their_campus(): void
    {
        [$campus, $user, $student] = $this->account();
        $otherCampus = Campus::create(['name' => 'Other campus', 'code' => 'OTHER']);
        $otherStudent = $this->student($campus, 'OTHER');
        $own = $this->payment($student);
        $others = $this->payment($otherStudent);
        $wrongCampus = $this->payment($student, ['campus_id' => $otherCampus->id]);
        $this->expectDocument('pdf.fee-receipt', "receipt-{$own->id}.pdf", function ($data) use ($own, $student) {
            $this->assertSame($own->id, $data['payment']->id);
            $this->assertSame($student->id, $data['payment']->student->id);
        });

        $this->actingAs($user)->withSession(['active_campus_id' => $otherCampus->id])
            ->get(route('portal.receipt', $own))->assertOk()->assertDownload("receipt-{$own->id}.pdf")
            ->assertHeader('X-Content-Type-Options', 'nosniff');
        $this->get(route('portal.receipt', $others))->assertNotFound();
        $this->get(route('portal.receipt', $wrongCampus))->assertNotFound();
    }

    public function test_report_card_contains_only_own_marks_for_the_requested_published_exam(): void
    {
        [$campus, $user, $student, $subject] = $this->account();
        $exam = $this->exam($campus, 'Published');
        $otherExam = $this->exam($campus, 'Another published exam');
        $draft = $this->exam($campus, 'Draft', ['results_published' => false]);
        $otherCampus = Campus::create(['name' => 'Other campus', 'code' => 'OTHER']);
        $remoteExam = $this->exam($otherCampus, 'Foreign exam');
        $ownMark = $this->mark($student, $exam, $subject);
        $this->mark($student, $otherExam, $subject, ['marks_obtained' => 55]);
        $this->mark($this->student($campus, 'OTHER'), $exam, $subject, ['marks_obtained' => 99]);
        $this->expectDocument('pdf.report-card', "report-card-{$student->id}-{$exam->id}.pdf", function ($data) use ($student, $exam, $ownMark) {
            $this->assertSame($student->id, $data['s']->id);
            $this->assertSame($exam->id, $data['e']->id);
            $this->assertSame([$ownMark->id], $data['marks']->modelKeys());
        });

        $this->actingAs($user)->get(route('portal.report-card', $exam))->assertOk();
        $this->get(route('portal.report-card', $draft))->assertNotFound();
        $this->get(route('portal.report-card', $remoteExam))->assertNotFound();
        $this->get(route('portal.report-card', $this->exam($campus, 'No student results')))->assertNotFound();
    }

    public function test_transcript_preserves_published_history_and_excludes_unpublished_and_foreign_marks(): void
    {
        [$campus, $user, $student, $subject] = $this->account();
        $pastExam = $this->exam($campus, 'Previous year', ['start_date' => '2025-11-01']);
        $currentExam = $this->exam($campus, 'Current year', ['start_date' => '2026-11-01']);
        $draft = $this->exam($campus, 'Draft', ['results_published' => false]);
        $otherCampus = Campus::create(['name' => 'Other campus', 'code' => 'OTHER']);
        $remoteExam = $this->exam($otherCampus, 'Foreign exam');
        $past = $this->mark($student, $pastExam, $subject, ['school_class_id' => 1]);
        $current = $this->mark($student, $currentExam, $subject, ['school_class_id' => 2]);
        $this->mark($student, $draft, $subject);
        $this->mark($student, $remoteExam, $subject);
        $this->mark($this->student($campus, 'OTHER'), $currentExam, $subject);
        $foreignSubject = Subject::create(['campus_id' => $otherCampus->id, 'name' => 'Foreign subject']);
        $this->mark($student, $currentExam, $foreignSubject, ['campus_id' => $otherCampus->id]);
        $this->expectDocument('pdf.student-transcript', "transcript-{$student->id}.pdf", function ($data) use ($student, $pastExam, $currentExam, $past, $current) {
            $this->assertSame($student->id, $data['student']->id);
            $this->assertSame([$pastExam->id, $currentExam->id], $data['marksByExam']->keys()->all());
            $this->assertSame([$past->id, $current->id], $data['marksByExam']->flatten()->pluck('id')->all());
        });

        $this->actingAs($user)->get(route('portal.transcript'))->assertOk();
    }

    public function test_documents_require_a_linked_student_in_the_accounts_active_campus(): void
    {
        [$campus, $user, $student] = $this->account();
        $payment = $this->payment($student);
        $exam = $this->exam($campus, 'Published');
        $urls = [route('portal.receipt', $payment), route('portal.report-card', $exam), route('portal.transcript')];
        $this->actingAs($user);

        $student->update(['user_id' => null]);
        foreach ($urls as $url) $this->get($url)->assertForbidden();

        $student->update(['user_id' => $user->id]);
        $user->update(['campus_id' => null]);
        foreach ($urls as $url) $this->get($url)->assertForbidden();

        $user->update(['campus_id' => $campus->id]);
        $otherCampus = Campus::create(['name' => 'Other campus', 'code' => 'OTHER']);
        $student->update(['campus_id' => $otherCampus->id]);
        foreach ($urls as $url) $this->get($url)->assertForbidden();
    }

    public function test_academic_document_routes_keep_the_existing_result_permission_requirement(): void
    {
        [$campus, $user] = $this->account();
        $user->revokePermissionTo('portal.results.view');
        $exam = $this->exam($campus, 'Published');

        $this->actingAs($user)->get(route('portal.report-card', $exam))->assertForbidden();
        $this->get(route('portal.transcript'))->assertForbidden();
    }

    public function test_real_document_templates_render_as_private_pdf_downloads(): void
    {
        [$campus, $user, $student, $subject] = $this->account();
        $payment = $this->payment($student);
        $exam = $this->exam($campus, 'Published');
        $this->mark($student, $exam, $subject);
        $this->actingAs($user);

        foreach ([route('portal.receipt', $payment), route('portal.report-card', $exam), route('portal.transcript')] as $url) {
            $response = $this->get($url)->assertOk()->assertDownload()->assertHeader('Content-Type', 'application/pdf');
            $this->assertStringStartsWith('%PDF-', $response->getContent());
            $this->assertStringContainsString('private', $response->headers->get('Cache-Control'));
            $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
        }
    }

    private function account(): array
    {
        $campus = Campus::create(['name' => 'Student campus', 'code' => 'STUDENT']);
        $user = User::factory()->create(['campus_id' => $campus->id]);
        foreach (['portal.services.view', 'portal.results.view'] as $name) {
            $user->givePermissionTo(Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']));
        }
        $student = $this->student($campus, 'OWN', $user);
        $subject = Subject::create(['campus_id' => $campus->id, 'name' => 'Mathematics']);

        return [$campus, $user, $student, $subject];
    }

    private function student(Campus $campus, string $suffix, ?User $user = null): Student
    {
        $guardian = Guardian::create(['campus_id' => $campus->id, 'father_name' => 'Father', 'mother_name' => 'Mother']);

        return Student::create([
            'campus_id' => $campus->id, 'user_id' => $user?->id, 'guardian_id' => $guardian->id,
            'admission_no' => 'DOC-'.$suffix, 'admission_date' => '2026-01-01', 'first_name' => 'Student',
            'gender' => 'male', 'date_of_birth' => '2015-01-01', 'present_address' => 'Dhaka', 'permanent_address' => 'Dhaka',
        ]);
    }

    private function payment(Student $student, array $overrides = []): Payment
    {
        return Payment::create(array_merge([
            'campus_id' => $student->campus_id, 'student_id' => $student->id, 'fee_assignment_id' => 1,
            'amount_paid' => 500, 'payment_date' => '2026-09-01', 'payment_method' => 'Cash',
        ], $overrides));
    }

    private function exam(Campus $campus, string $name, array $overrides = []): Exam
    {
        return Exam::create(array_merge(['campus_id' => $campus->id, 'name' => $name, 'results_published' => true], $overrides));
    }

    private function mark(Student $student, Exam $exam, Subject $subject, array $overrides = []): ExamMark
    {
        return ExamMark::create(array_merge([
            'campus_id' => $student->campus_id, 'exam_id' => $exam->id, 'student_id' => $student->id,
            'school_class_id' => 1, 'subject_id' => $subject->id, 'marks_obtained' => 85, 'grade' => 'A+', 'grade_point' => 5,
        ], $overrides));
    }

    private function expectDocument(string $view, string $filename, callable $inspect): void
    {
        $document = Mockery::mock();
        $document->shouldReceive('download')->once()->with($filename)->andReturn(response('%PDF-test', 200, [
            'Content-Type' => 'application/pdf', 'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ]));
        Pdf::shouldReceive('loadView')->once()->withArgs(function ($actualView, $data) use ($view, $inspect) {
            $this->assertSame($view, $actualView);
            $inspect($data);

            return true;
        })->andReturn($document);
    }
}
