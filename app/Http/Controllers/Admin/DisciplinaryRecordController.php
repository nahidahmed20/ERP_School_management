<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DisciplinaryRecord;
use App\Models\Student;
use App\Models\AcademicSession;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DisciplinaryRecordController extends Controller
{
    public function index(Request $request)
    {
        $query = DisciplinaryRecord::with(['student.currentEnrollment.schoolClass']);

        if ($search = $request->search) {
            $query->whereHas('student', function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('admission_no', 'like', "%{$search}%");
            })->orWhere('title', 'like', "%{$search}%");
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $records = $query->latest('incident_date')->paginate($request->per_page ?? 10)->withQueryString();
        $students = Student::select('id', 'first_name', 'last_name', 'admission_no')->where('status', true)->get();

        return Inertia::render('Admin/StudentsDiscipline/Index', [
            'records' => $records,
            'students' => $students,
            'filters' => $request->only(['search', 'type', 'per_page'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'title' => 'required|string|max:255',
            'type' => 'required|in:Complaint,Warning,Suspension,Reward,Other',
            'incident_date' => 'required|date',
        ]);

        $activeSession = AcademicSession::where('is_current', 1)->first();

        DisciplinaryRecord::create(array_merge($request->all(), [
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