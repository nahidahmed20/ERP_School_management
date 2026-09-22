<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DisciplinaryRecord;
use App\Models\Student;
use App\Models\AcademicSession;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule; 
use Inertia\Inertia;

class DisciplinaryRecordController extends Controller
{
    public function index(Request $request)
    {
        $campusId = config('app.active_campus_id');

        $query = DisciplinaryRecord::with(['student.currentEnrollment.schoolClass'])
            ->latest('incident_date');

        $studentQuery = Student::select('id', 'first_name', 'last_name', 'admission_no')
            ->where('status', true);

        if ($campusId) {
            $query->where('campus_id', $campusId);
            $studentQuery->where('campus_id', $campusId);
        }

        if ($search = $request->search) {
            $query->where(function($q) use ($search) {
                $q->whereHas('student', function($sq) use ($search) {
                    $sq->where('first_name', 'like', "%{$search}%")
                      ->orWhere('admission_no', 'like', "%{$search}%");
                })->orWhere('title', 'like', "%{$search}%");
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $records = $query->paginate(\App\Support\PerPage::resolve())->withQueryString();
        $students = $studentQuery->get();

        return Inertia::render('Admin/StudentsDiscipline/Index', [
            'records' => $records,
            'students' => $students,
            'filters' => $request->only(['search', 'type', 'per_page'])
        ]);
    }

    public function store(Request $request)
    {
        $campusId = config('app.active_campus_id');

        $studentRule = Rule::exists('students', 'id');
        if ($campusId) {
            $studentRule->where('campus_id', $campusId);
        }

        $request->validate([
            'student_id' => ['required', $studentRule],
            'title' => 'required|string|max:255',
            'type' => 'required|in:Complaint,Warning,Suspension,Reward,Other',
            'incident_date' => 'required|date',
        ]);

        $activeSession = AcademicSession::where('is_current', 1)->first();
        $student = Student::findOrFail($request->student_id);

        DisciplinaryRecord::create(array_merge($request->all(), [
            'campus_id' => $student->campus_id, 
            'academic_session_id' => $activeSession?->id
        ]));

        return back()->with('success', 'রেকর্ড সফলভাবে যুক্ত করা হয়েছে!');
    }

    public function update(Request $request, $id)
    {
        $record = DisciplinaryRecord::findOrFail($id);
        
        $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:Complaint,Warning,Suspension,Reward,Other',
            'incident_date' => 'required|date',
        ]);

        $record->update($request->all());

        return back()->with('success', 'রেকর্ড আপডেট করা হয়েছে!');
    }

    public function destroy($id)
    {
        DisciplinaryRecord::findOrFail($id)->delete();
        return back()->with('success', 'রেকর্ড মুছে ফেলা হয়েছে!');
    }
}