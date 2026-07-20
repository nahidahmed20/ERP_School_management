<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicSession;
use App\Models\Campus;
use App\Models\Enrollment;
use App\Models\Guardian;
use App\Models\House;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\StudentCategory;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search');

        $query = Student::with(['currentEnrollment.schoolClass', 'currentEnrollment.section', 'guardian.students', 'campus'])->latest();

        if ($request->filled('class_id')) {
            $query->whereHas('currentEnrollment', function($q) use ($request) {
                $q->where('class_id', $request->class_id);
            });
        }
        if ($request->filled('section_id')) {
            $query->whereHas('currentEnrollment', function($q) use ($request) {
                $q->where('section_id', $request->section_id);
            });
        }

        if ($request->filled('search')) {
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('admission_no', 'like', "%{$search}%")
                  ->orWhereHas('guardian', function($gQ) use ($search) {
                      $gQ->where('father_name', 'like', "%{$search}%")
                         ->orWhere('father_phone', 'like', "%{$search}%");
                  });
            });
        }

        $students = ($perPage === 'all')
            ? $query->paginate($query->count())->withQueryString()
            : $query->paginate($perPage)->withQueryString();

        return Inertia::render('Admin/Students/Index', [
            'students' => $students,
            'classes' => SchoolClass::with('sections')->where('is_active', true)->get(),
            'filters' => $request->only(['class_id', 'section_id', 'search', 'per_page']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Students/Create', [
            'classes' => SchoolClass::with('sections')->where('is_active', true)->get(),
            'active_session' => AcademicSession::where('is_active', 1)->where('is_current', 1)->first(),
            'campuses' => Campus::all(),
            'categories' => StudentCategory::all(),
            'houses' => House::all(),
        ]);
    }

    public function searchGuardian(Request $request)
    {
        $query = $request->input('query');

        if (!$query) {
            return response()->json(['guardian' => null]);
        }
        $guardian = Guardian::where('father_phone', $query)
            ->orWhereHas('students', function($q) use ($query) {
                $q->where('admission_no', $query);
            })
            ->first();

        return response()->json(['guardian' => $guardian]);
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->studentValidationRules());
        $activeSession = AcademicSession::where('is_active', 1)->where('is_current', 1)->first();

        if (!$activeSession) {
            return back()->with('error', 'কোনো অ্যাক্টিভ শিক্ষাবর্ষ পাওয়া যায়নি! আগে একটি শিক্ষাবর্ষ চালু করুন।');
        }

        DB::beginTransaction();
        try {
            $guardianUserId = null;
            $guardianId = null;

            if ($request->filled('guardian_id')) {
                $guardianId = $request->guardian_id;
                $guardian = Guardian::find($guardianId);

                if ($guardian && $request->create_parent_user && !$guardian->user_id) {
                    $parentEmail = $request->guardian_email ?? $request->father_phone . '@parent.school.com';
                    $guardianUser = User::firstOrCreate(
                        ['email' => $parentEmail],
                        [
                            'name' => $request->father_name,
                            'password' => Hash::make($request->father_phone),
                            'campus_id' => $request->campus_id,
                        ]
                    );

                    if (!$guardianUser->hasRole('parent')) {
                        $guardianUser->assignRole('parent');
                    }
                    $guardian->update(['user_id' => $guardianUser->id]);
                }
            }
            else {
                if ($request->create_parent_user) {
                    $parentEmail = $request->guardian_email ?? $request->father_phone . '@parent.school.com';

                    $guardianUser = User::firstOrCreate(
                        ['email' => $parentEmail],
                        [
                            'name' => $request->father_name,
                            'password' => Hash::make($request->father_phone),
                            'campus_id'         => $request->campus_id,
                        ]
                    );

                    if (!$guardianUser->hasRole('parent')) {
                        $guardianUser->assignRole('parent');
                    }
                    $guardianUserId = $guardianUser->id;
                }

                $guardian = Guardian::firstOrCreate(
                    ['father_phone' => $request->father_phone],
                    [
                        'user_id'       => $guardianUserId,
                        'father_name'   => $request->father_name,
                        'mother_name'   => $request->mother_name,
                        'mother_phone'  => $request->mother_phone,
                        'guardian_email'=> $request->guardian_email,
                        'address'       => $request->present_address,
                    ]
                );

                $guardianId = $guardian->id;
            }

            $lastStudent = Student::latest('id')->first();
            $admissionNo = 'STU-' . date('Y') . '-' . sprintf('%04d', $lastStudent ? $lastStudent->id + 1 : 1);

            $studentUserId = null;
            if ($request->create_student_user) {
                $studentEmail = $request->email ?? $admissionNo . '@student.school.com';

                $studentUser = User::create([
                    'name'       => $request->first_name . ' ' . $request->last_name,
                    'email'      => $studentEmail,
                    'password'   => Hash::make($admissionNo),
                    'campus_id'  => $request->campus_id,
                ]);

                $studentUser->assignRole('student');
                $studentUserId = $studentUser->id;
            }

            $photoPath = null;
            if ($request->hasFile('photo')) {
                $photoPath = $request->file('photo')->store('students', 'public');
            }

            $student = Student::create([
                'campus_id'         => $request->campus_id,
                'user_id'           => $studentUserId,
                'guardian_id'       => $guardianId,
                'category_id'       => $request->category_id,
                'house_id'          => $request->house_id,
                'admission_no'      => $admissionNo,
                'admission_date'    => $request->admission_date,
                'first_name'        => $request->first_name,
                'last_name'         => $request->last_name,
                'gender'            => $request->gender,
                'date_of_birth'     => $request->date_of_birth,
                'birth_certificate_no' => $request->birth_certificate_no,
                'national_id'       => $request->national_id,
                'mother_tongue'     => $request->mother_tongue,
                'blood_group'       => $request->blood_group,
                'religion'          => $request->religion,
                'nationality'       => $request->nationality,
                'phone'             => $request->phone,
                'email'             => $request->email,
                'previous_school_details' => $request->previous_school_details,
                'medical_history'   => $request->medical_history,
                'present_address'   => $request->present_address,
                'permanent_address' => $request->permanent_address,
                'photo'             => $photoPath,
                'status'            => true,
            ]);

            Enrollment::create([
                'student_id'            => $student->id,
                'academic_session_id'   => $activeSession->id,
                'class_id'              => $request->class_id,
                'section_id'            => $request->section_id,
                'roll_no'               => $request->roll_no,
                'is_current'            => true,
            ]);

            DB::commit();
            return redirect()->route('admin.students.index')->with('success', 'স্টুডেন্ট ভর্তি এবং অ্যাকাউন্ট তৈরি সফল হয়েছে!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'সমস্যা হয়েছে: ' . $e->getMessage());
        }
    }

    public function edit($id)
    {
        $student = Student::with(['guardian.students', 'currentEnrollment'])->findOrFail($id);

        return Inertia::render('Admin/Students/Edit', [
            'student' => $student,
            'classes' => SchoolClass::with('sections')->where('is_active', true)->get(),
            'campuses' => Campus::all(),
            'categories' => StudentCategory::all(),
            'houses' => House::all(),
        ]);
    }

    public function update(Request $request, $id)
    {
        $student = Student::with(['guardian', 'currentEnrollment'])->findOrFail($id);
        $data = $request->validate($this->studentValidationRules(isUpdate: true, studentId: $student->id));

        DB::beginTransaction();
        try {
            if ($student->guardian) {
                $student->guardian->update([
                    'father_name'   => $request->father_name,
                    'father_phone'  => $request->father_phone,
                    'mother_name'   => $request->mother_name,
                    'mother_phone'  => $request->mother_phone,
                    'guardian_email'=> $request->guardian_email,
                ]);

                if ($student->guardian->user_id) {
                    $guardianUser = User::find($student->guardian->user_id);
                    if ($guardianUser) {
                        $guardianUser->update([
                            'name' => $request->father_name,
                            'email' => $request->guardian_email ?? $guardianUser->email,
                        ]);
                    }
                }
            }

            if ($student->user_id) {
                $studentUser = User::find($student->user_id);
                if ($studentUser) {
                    $studentUser->update([
                        'name' => $request->first_name . ' ' . $request->last_name,
                        'email' => $request->email ?? $studentUser->email,
                    ]);
                }
            }

            $photoPath = $student->photo;
            if ($request->hasFile('photo')) {
                if ($student->photo && Storage::disk('public')->exists($student->photo)) {
                    Storage::disk('public')->delete($student->photo);
                }
                $photoPath = $request->file('photo')->store('students', 'public');
            }

            $student->update([
                'campus_id'         => $request->campus_id,
                'category_id'       => $request->category_id,
                'house_id'          => $request->house_id,
                'first_name'        => $request->first_name,
                'last_name'         => $request->last_name,
                'gender'            => $request->gender,
                'date_of_birth'     => $request->date_of_birth,
                'birth_certificate_no' => $request->birth_certificate_no,
                'national_id'       => $request->national_id,
                'mother_tongue'     => $request->mother_tongue,
                'blood_group'       => $request->blood_group,
                'religion'          => $request->religion,
                'nationality'       => $request->nationality,
                'phone'             => $request->phone,
                'email'             => $request->email,
                'previous_school_details' => $request->previous_school_details,
                'medical_history'   => $request->medical_history,
                'present_address'   => $request->present_address,
                'permanent_address' => $request->permanent_address,
                'photo'             => $photoPath,
            ]);

            if ($student->currentEnrollment) {
                $student->currentEnrollment->update([
                    'class_id'      => $request->class_id,
                    'section_id'    => $request->section_id,
                    'roll_no'       => $request->roll_no,
                ]);
            }

            DB::commit();
            return redirect()->route('admin.students.index')->with('success', 'স্টুডেন্টের তথ্য এবং ইউজার অ্যাকাউন্ট সফলভাবে আপডেট হয়েছে!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'আপডেট করতে সমস্যা হয়েছে: ' . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        $student = Student::findOrFail($id);

        DB::beginTransaction();
        try {
            if ($student->user_id) {
                User::where('id', $student->user_id)->delete();
            }

            $guardianId = $student->guardian_id;

            $student->delete();

            $otherSiblingsCount = Student::where('guardian_id', $guardianId)->count();

            if ($otherSiblingsCount === 0) {
                $guardian = Guardian::find($guardianId);
                if ($guardian) {
                    if ($guardian->user_id) {
                        User::where('id', $guardian->user_id)->delete();
                    }
                    $guardian->delete();
                }
            }

            DB::commit();
            return back()->with('success', 'স্টুডেন্ট এবং তার অ্যাক্সেস মুছে ফেলা হয়েছে!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'ডিলিট করতে সমস্যা হয়েছে: ' . $e->getMessage());
        }
    }

    private function studentValidationRules(bool $isUpdate = false, $studentId = null): array
    {
        $rules = [
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'campus_id'     => 'required|exists:campuses,id',
            'class_id'      => 'required|exists:school_classes,id',
            'section_id'    => 'required|exists:sections,id',
            'roll_no'       => 'nullable|string|max:50',

            'category_id'   => 'nullable|integer',
            'house_id'      => 'nullable|integer',
            'birth_certificate_no' => 'nullable|string|max:100' . ($isUpdate ? "|unique:students,birth_certificate_no,{$studentId}" : '|unique:students,birth_certificate_no'),
            'national_id'   => 'nullable|string|max:100' . ($isUpdate ? "|unique:students,national_id,{$studentId}" : '|unique:students,national_id'),
            'mother_tongue' => 'nullable|string|max:100',
            'previous_school_details' => 'nullable|string',
            'medical_history' => 'nullable|string',

            'first_name'    => 'required|string|max:255',
            'last_name'     => 'nullable|string|max:255',
            'date_of_birth' => 'required|date',
            'gender'        => 'required|in:male,female,other',
            'blood_group'   => 'nullable|string|max:10',
            'religion'      => 'nullable|string|max:50',
            'nationality'   => 'required|string|max:100',
            'phone'         => 'nullable|string|max:20',
            'email'         => 'nullable|email|max:255',
            'present_address' => 'required|string',
            'permanent_address' => 'required|string',

            'father_name'   => 'required|string|max:255',
            'father_phone'  => 'required|string|max:20',
            'mother_name'   => 'required|string|max:255',
            'mother_phone'  => 'nullable|string|max:20',
            'guardian_email'=> 'nullable|email|max:255',
        ];

        if (!$isUpdate) {
            $rules['admission_date'] = 'required|date';
            $rules['create_student_user'] = 'nullable|boolean';
            $rules['create_parent_user'] = 'nullable|boolean';
        }

        return $rules;
    }
}
