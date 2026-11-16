<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentDevelopmentRecord;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class StudentDevelopmentRecordController extends Controller
{
    private const TYPES = ['counselling','guardian_meeting','scholarship','co_curricular','achievement','behaviour','learning_support','career_guidance'];

    public function index(Request $request)
    {
        $campusId = config('app.active_campus_id');

        $query = StudentDevelopmentRecord::with(['student:id,first_name,last_name,admission_no,campus_id', 'student.currentEnrollment.schoolClass:id,name', 'student.currentEnrollment.section:id,name'])
            ->latest('record_date');
            
        $studentQuery = Student::with(['currentEnrollment.schoolClass:id,name'])
            ->where('status', true)
            ->orderBy('first_name');

       
        if ($campusId) {
            $query->where('campus_id', $campusId);
            $studentQuery->where('campus_id', $campusId);
        }

        if ($request->filled('type')) $query->where('record_type', $request->type);
        if ($request->filled('student_id')) $query->where('student_id', $request->student_id);
        if ($request->filled('search')) {
            $query->where(fn($q) => $q->where('title','like',"%{$request->search}%")
                ->orWhereHas('student',fn($s)=>$s->where('first_name','like',"%{$request->search}%")->orWhere('admission_no','like',"%{$request->search}%")));
        }

        // Summary Counters
        $summaryQuery = StudentDevelopmentRecord::query();
        if ($campusId) $summaryQuery->where('campus_id', $campusId);

        return Inertia::render('Admin/Students/Development/Index', [
            'records' => $query->paginate(\App\Support\PerPage::resolve(15))->withQueryString(),
            'studentList' => $studentQuery->get(['id','first_name','last_name','admission_no','campus_id']),
            'filters' => $request->only(['type','student_id','search']),
            'summary' => collect(self::TYPES)->mapWithKeys(fn($type) => [
                $type => (clone $summaryQuery)->where('record_type', $type)->count()
            ]),
        ]);
    }

    public function store(Request $request) 
    { 
        $validated = $this->validated($request);
        
        $student = Student::findOrFail($validated['student_id']);

        StudentDevelopmentRecord::create($validated + [
            'campus_id' => $student->campus_id,
            'recorded_by' => $request->user()->id
        ]); 

        return back()->with('success','Student development record added successfully.'); 
    }

    public function update(Request $request, StudentDevelopmentRecord $student_development_record) 
    { 
        $student_development_record->update($this->validated($request)); 
        return back()->with('success','Student development record updated successfully.'); 
    }

    public function destroy(StudentDevelopmentRecord $student_development_record) 
    { 
        $student_development_record->delete(); 
        return back()->with('success','Student development record deleted successfully.'); 
    }

    private function validated(Request $request): array
    {
        $campusId = config('app.active_campus_id');
        
        $studentRule = Rule::exists('students', 'id');
        if ($campusId) {
            $studentRule->where('campus_id', $campusId);
        }

        return $request->validate([
            'student_id' => ['required', $studentRule],
            'record_type' => ['required', Rule::in(self::TYPES)],
            'record_date' => 'required|date',
            'follow_up_date' => 'nullable|date|after_or_equal:record_date',
            'title' => 'required|string|max:255',
            'period' => 'nullable|string|max:100',
            'amount' => 'nullable|numeric|min:0',
            'score' => 'nullable|numeric|min:0|max:100',
            'status' => 'required|in:open,in_progress,resolved,awarded,completed,cancelled',
            'details' => 'nullable|array',
            'details.*' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:2000',
        ]);
    }
}