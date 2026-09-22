<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{AcademicSession, ClassDiary, ClassSubstitution, ParentTeacherMeeting, SchoolClass, Staff, Student, StudentTransfer, Subject, SyllabusTopic, TeacherAssignment};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AcademicOperationsController extends Controller
{
    private function existsRule(string $table)
    {
        $campusId = config('app.active_campus_id');
        $rule = Rule::exists($table, 'id');
        return $campusId ? $rule->where('campus_id', $campusId) : $rule;
    }

    public function index()
    {
        $campusId = config('app.active_campus_id');

        // 🔒 Data Leak Protection Logic
        $filter = fn($q) => $campusId ? $q->where('campus_id', $campusId) : $q;

        return Inertia::render('Admin/AcademicOperations/Index', [
            'assignments' => TeacherAssignment::with(['staff','schoolClass','section','subject'])->where($filter)->latest()->take(50)->get(),
            'topics' => SyllabusTopic::where($filter)->latest()->take(50)->get(),
            'diaries' => ClassDiary::where($filter)->latest('date')->take(50)->get(),
            'substitutions' => ClassSubstitution::where($filter)->latest('date')->take(50)->get(),

            'meetings' => ParentTeacherMeeting::where($filter)->latest('requested_at')->take(50)->get(),

            'transfers' => StudentTransfer::where($filter)->latest()->take(50)->get(),
            'sessions' => AcademicSession::latest()->get(['id','name']),
            'classes' => SchoolClass::with('sections:id,name')->where('is_active', true)->where($filter)->get(['id','name']),
            'subjects' => Subject::where('is_active', true)->where($filter)->get(['id','name']),
            'staff' => Staff::where($filter)->orderBy('first_name')->get(['id','first_name','last_name','staff_id_no']),
            'students' => Student::where($filter)->orderBy('first_name')->get(['id','first_name','last_name','admission_no','guardian_id']),
        ]);
    }

    public function assignment(Request $request)
    {
        $data = $request->validate([
            'staff_id' => ['required', $this->existsRule('staff')],
            'class_id' => ['required', $this->existsRule('school_classes')],
            'section_id' => ['required', $this->existsRule('sections')],
            'subject_id' => ['required', $this->existsRule('subjects')],
            'is_class_teacher' => 'boolean'
        ]);

        $class = SchoolClass::findOrFail($request->class_id);
        TeacherAssignment::updateOrCreate(
            collect($data)->only(['staff_id','class_id','section_id','subject_id'])->all(),
            $data + ['is_active' => true, 'campus_id' => $class->campus_id]
        );
        return back()->with('success','Teacher assignment saved.');
    }

    public function topic(Request $request)
    {
        $data = $request->validate([
            'academic_session_id' => ['required', Rule::exists('academic_sessions', 'id')],
            'class_id' => ['required', $this->existsRule('school_classes')],
            'section_id' => ['nullable', $this->existsRule('sections')],
            'subject_id' => ['required', $this->existsRule('subjects')],
            'title' => 'required|string|max:255',
            'planned_date' => 'nullable|date'
        ]);

        $class = SchoolClass::findOrFail($request->class_id);
        SyllabusTopic::create($data + ['campus_id' => $class->campus_id]);
        return back()->with('success','Syllabus topic added.');
    }

    public function topicStatus(Request $request, SyllabusTopic $topic)
    {
        $data = $request->validate(['status' => ['required', Rule::in(['planned','in_progress','completed'])]]);
        $topic->update($data + ['completed_at' => $data['status'] === 'completed' ? now() : null, 'completed_by' => $data['status'] === 'completed' ? $request->user()->id : null]);
        return back()->with('success','Syllabus progress updated.');
    }

    public function diary(Request $request)
    {
        $data = $request->validate([
            'date' => 'required|date',
            'class_id' => ['required', $this->existsRule('school_classes')],
            'section_id' => ['required', $this->existsRule('sections')],
            'subject_id' => ['nullable', $this->existsRule('subjects')],
            'teacher_id' => ['required', $this->existsRule('staff')],
            'topic' => 'required|string|max:255',
            'homework' => 'nullable|string',
            'notes' => 'nullable|string'
        ]);

        $class = SchoolClass::findOrFail($request->class_id);
        ClassDiary::create($data + ['campus_id' => $class->campus_id]);
        return back()->with('success','Class diary saved.');
    }

    public function substitution(Request $request)
    {
        $data = $request->validate([
            'date' => 'required|date',
            'class_id' => ['required', $this->existsRule('school_classes')],
            'section_id' => ['required', $this->existsRule('sections')],
            'subject_id' => ['nullable', $this->existsRule('subjects')],
            'absent_teacher_id' => ['required', 'different:substitute_teacher_id', $this->existsRule('staff')],
            'substitute_teacher_id' => ['required', $this->existsRule('staff')],
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'reason' => 'nullable|string'
        ]);

        $class = SchoolClass::findOrFail($request->class_id);
        ClassSubstitution::create($data + ['campus_id' => $class->campus_id]);
        return back()->with('success','Substitute teacher assigned.');
    }

    public function meeting(Request $request)
    {
        $data = $request->validate([
            'student_id' => ['required', $this->existsRule('students')],
            'teacher_id' => ['required', $this->existsRule('staff')],
            'scheduled_at' => 'required|date',
            'agenda' => 'required|string',
            'notes' => 'nullable|string'
        ]);

        $student = Student::findOrFail($data['student_id']);
        ParentTeacherMeeting::create([
            'campus_id' => $student->campus_id,
            'student_id' => $data['student_id'],
            'staff_id' => $data['teacher_id'],
            'requested_at' => $data['scheduled_at'],
            'agenda' => $data['agenda'],
            'notes' => $data['notes'] ?? null,
            'guardian_id' => $student->guardian_id,
            'status' => 'pending'
        ]);
        return back()->with('success','Parent-teacher meeting scheduled.');
    }

    public function meetingStatus(Request $request, ParentTeacherMeeting $meeting)
    {
        $meeting->update($request->validate(['status' => ['required', Rule::in(['scheduled','completed','cancelled','no_show'])], 'notes' => 'nullable|string']));
        return back()->with('success','Meeting status updated.');
    }

    public function transfer(Request $request)
    {
        $data = $request->validate([
            'student_id' => ['required', $this->existsRule('students')],
            'type' => ['required', Rule::in(['transfer','withdrawal'])],
            'effective_date' => 'required|date',
            'reason' => 'required|string',
            'destination_school' => 'nullable|string|max:255'
        ]);

        $student = Student::with('currentEnrollment')->findOrFail($data['student_id']);
        StudentTransfer::create($data + ['campus_id' => $student->campus_id, 'previous_enrollment_id' => $student->currentEnrollment?->id]);
        return back()->with('success','Transfer/withdrawal request created.');
    }

    public function approveTransfer(Request $request, StudentTransfer $transfer)
    {
        abort_if($transfer->status !== 'requested', 422, 'Only requested records can be approved.');

        DB::transaction(function () use ($transfer, $request) {
            $transfer->update([
                'status' => 'clearance_pending',
                'approved_by' => $request->user()->id,
                'approved_at' => now(),
                'certificate_no' => $transfer->certificate_no ?: 'TC-'.now()->format('Ymd').'-'.$transfer->id
            ]);

            foreach (['Accounts','Library','Transport','Hostel','Academic'] as $department) {
                DB::table('student_clearances')->updateOrInsert(
                    ['student_id' => $transfer->student_id, 'department' => $department],
                    ['campus_id' => $transfer->campus_id, 'student_transfer_id' => $transfer->id, 'status' => 'pending', 'amount_due' => 0, 'cleared_by' => null, 'cleared_at' => null, 'created_at' => now(), 'updated_at' => now()]
                );
            }
        });

        return back()->with('success','Transfer approved. Student will remain active until every department completes clearance.');
    }
}
