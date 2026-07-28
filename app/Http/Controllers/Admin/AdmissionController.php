<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admission;
use App\Models\SchoolClass;
use App\Models\AcademicSession;
use App\Models\Student;
use App\Models\User;
use App\Models\Guardian;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class AdmissionController extends Controller
{
    public function index(Request $request)
    {
        $query = Admission::with('schoolClass');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('guardian_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('class_id')) {
            $query->where('class_id', $request->get('class_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        $admissions = $query->latest('application_date')->paginate($request->per_page ?? 10)->withQueryString();

        return Inertia::render('Admin/StudentsAdmissions/Index', [
            'admissions' => $admissions,
            'classes' => SchoolClass::where('is_active', true)->select('id', 'name')->get(),
            'filters' => $request->only(['search', 'class_id', 'status', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'class_id' => 'required|exists:school_classes,id',
            'first_name' => 'required|string|max:255',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:male,female,other',
            'guardian_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'application_date' => 'required|date',
        ]);

        $activeSession = AcademicSession::where('is_current', 1)->first();

        Admission::create(array_merge($request->all(), [
            'academic_session_id' => $activeSession?->id,
            'campus_id' => session('active_campus_id')
        ]));

        return back()->with('success', 'ভর্তির আবেদন সফলভাবে জমা হয়েছে!');
    }

    public function update(Request $request, $id)
    {
        $admission = Admission::findOrFail($id);
        
        $request->validate([
            'status' => 'required|in:Pending,Approved,Rejected',
            'section_id' => 'required_if:status,Approved|nullable|exists:sections,id',
            'notes' => 'nullable|string'
        ]);

        if ($request->status === 'Approved' && $admission->status !== 'Approved') {
            
            DB::beginTransaction();
            try {
                $parentEmail = $admission->email ?? $admission->phone . '@parent.school.com';
                $guardianUser = User::firstOrCreate(
                    ['email' => $parentEmail],
                    [
                        'name' => $admission->guardian_name,
                        'password' => Hash::make($admission->phone),
                        'campus_id' => $admission->campus_id,
                    ]
                );
                
                if (!$guardianUser->hasRole('parent')) {
                    $guardianUser->assignRole('parent');
                }

                $guardian = Guardian::firstOrCreate(
                    ['father_phone' => $admission->phone],
                    [
                        'user_id' => $guardianUser->id,
                        'father_name' => $admission->guardian_name,
                        'address' => $admission->address,
                    ]
                );

                $lastStudent = Student::latest('id')->first();
                $admissionNo = 'STU-' . date('Y') . '-' . sprintf('%04d', $lastStudent ? $lastStudent->id + 1 : 1);

                $studentEmail = $admissionNo . '@student.school.com';
                $studentUser = User::create([
                    'name' => $admission->first_name . ' ' . $admission->last_name,
                    'email' => $studentEmail,
                    'password' => Hash::make($admissionNo),
                    'campus_id' => $admission->campus_id,
                ]);
                $studentUser->assignRole('student');

                $student = Student::create([
                    'campus_id' => $admission->campus_id,
                    'user_id' => $studentUser->id,
                    'guardian_id' => $guardian->id,
                    'admission_no' => $admissionNo,
                    'admission_date' => date('Y-m-d'),
                    'first_name' => $admission->first_name,
                    'last_name' => $admission->last_name,
                    'gender' => $admission->gender,
                    'date_of_birth' => $admission->date_of_birth,
                    'phone' => $admission->phone,
                    'present_address' => $admission->address,
                    'nationality' => 'Bangladeshi', // Default
                    'status' => true,
                ]);

                Enrollment::create([
                    'student_id' => $student->id,
                    'academic_session_id' => $admission->academic_session_id,
                    'class_id' => $admission->class_id,
                    'section_id' => $request->section_id,
                    'is_current' => true,
                ]);

                $admission->update(['status' => 'Approved', 'notes' => $request->notes]);

                DB::commit();
                return back()->with('success', 'আবেদনটি Approved হয়েছে এবং স্টুডেন্ট প্রোফাইল স্বয়ংক্রিয়ভাবে তৈরি হয়েছে!');

            } catch (\Exception $e) {
                DB::rollBack();
                return back()->with('error', 'অ্যাপ্রুভ করতে সমস্যা হয়েছে: ' . $e->getMessage());
            }
        }

        $admission->update(['status' => $request->status, 'notes' => $request->notes]);
        return back()->with('success', 'আবেদনের স্ট্যাটাস আপডেট করা হয়েছে!');
    }

    public function destroy($id)
    {
        Admission::findOrFail($id)->delete();
        return back()->with('success', 'আবেদনটি মুছে ফেলা হয়েছে!');
    }
}