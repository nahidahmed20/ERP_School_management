<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use App\Models\Department;
use App\Models\Designation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Inertia\Inertia;
use Illuminate\Validation\Rule; 

class StaffController extends Controller
{
    public function index(Request $request)
    {
        $campusId = config('app.active_campus_id');
        $filter = fn($q) => $campusId ? $q->where('campus_id', $campusId) : $q;
        $globalFilter = fn($q) => $campusId ? $q->where(fn($q2) => $q2->where('campus_id', $campusId)->orWhereNull('campus_id')) : $q;

        $perPage = $request->input('per_page', 10);
        $search = $request->input('search');
        $departmentId = $request->input('department_id');
        $designationId = $request->input('designation_id');

        $query = Staff::where($filter)->with(['department', 'designation', 'user'])->latest();

        // Search Logic
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('staff_id_no', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Filters
        if ($departmentId) {
            $query->where('department_id', $departmentId);
        }
        if ($designationId) {
            $query->where('designation_id', $designationId);
        }

        $staff = ($perPage === 'all')
            ? $query->paginate($query->count())->withQueryString()
            : $query->paginate($perPage)->withQueryString();

        return Inertia::render('Admin/Staff/Index', [
            'staff' => $staff,
            'departments' => Department::where('is_active', true)->where($globalFilter)->get(),
            'designations' => Designation::where('is_active', true)->where($globalFilter)->get(),
            'filters' => $request->only(['search', 'department_id', 'designation_id', 'per_page']),
        ]);
    }

    public function create()
    {
        $campusId = config('app.active_campus_id');
        $globalFilter = fn($q) => $campusId ? $q->where(fn($q2) => $q2->where('campus_id', $campusId)->orWhereNull('campus_id')) : $q;

        $departments = Department::where('is_active', true)->where($globalFilter)->get();
        $designations = Designation::where('is_active', true)->where($globalFilter)->get();

        $roles = Role::where('name', '!=', 'super_admin')->get();

        return inertia('Admin/Staff/Create', compact('departments', 'designations', 'roles'));
    }

    public function store(Request $request)
    {
        $rules = $this->staffValidationRules();
        $rules['role_name'] = 'required_if:create_user_account,true';
        $request->validate($rules, [
            'role_name.required_if' => 'অ্যাকাউন্ট তৈরি করতে চাইলে একটি Role সিলেক্ট করা আবশ্যক।'
        ]);

        DB::beginTransaction();
        try {
            $lastStaff = Staff::withoutGlobalScope('campus')->withTrashed()->latest('id')->first();
            $staffIdNo = 'EMP-' . date('Y') . '-' . sprintf('%04d', $lastStaff ? $lastStaff->id + 1 : 1);

            $userId = null;
            if ($request->create_user_account) {
                $staffEmail = $request->email ?? strtolower($staffIdNo) . '@school.com';

                $user = User::create([
                    'name' => $request->first_name . ' ' . $request->last_name,
                    'email' => $staffEmail,
                    'password' => Hash::make($staffIdNo),
                    'campus_id' => config('app.active_campus_id'),
                ]);

                if ($request->role_name) {
                    $user->assignRole($request->role_name);
                }

                $userId = $user->id;
            }

            $photoPath = null;
            if ($request->hasFile('photo')) {
                $photoPath = $request->file('photo')->store('staffs', 'public');
            }

            Staff::create([
                'campus_id'         => config('app.active_campus_id'),
                'user_id'           => $userId,
                'department_id'     => $request->department_id,
                'designation_id'    => $request->designation_id,
                'staff_id_no'       => $staffIdNo,
                'first_name'        => $request->first_name,
                'last_name'         => $request->last_name,
                'father_name'       => $request->father_name,
                'mother_name'       => $request->mother_name,
                'gender'            => $request->gender,
                'date_of_birth'     => $request->date_of_birth,
                'joining_date'      => $request->joining_date,
                'phone'             => $request->phone,
                'emergency_phone'   => $request->emergency_phone,
                'email'             => $request->email,
                'marital_status'    => $request->marital_status,
                'blood_group'       => $request->blood_group,
                'present_address'   => $request->present_address,
                'permanent_address' => $request->permanent_address,
                'qualification'     => $request->qualification,
                'experience'        => $request->experience,
                'basic_salary'      => $request->basic_salary,
                'photo'             => $photoPath,
                'is_active'         => true,
            ]);

            DB::commit();
            return redirect()->route('admin.staff.index')->with('success', 'স্টাফ সফলভাবে যুক্ত করা হয়েছে!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'সমস্যা হয়েছে: ' . $e->getMessage());
        }
    }

    public function edit($id)
    {
        $campusId = config('app.active_campus_id');
        $filter = fn($q) => $campusId ? $q->where('campus_id', $campusId) : $q;
        $globalFilter = fn($q) => $campusId ? $q->where(fn($q2) => $q2->where('campus_id', $campusId)->orWhereNull('campus_id')) : $q;

        $staff = Staff::where($filter)->findOrFail($id);

        $currentRole = '';
        if ($staff->user_id) {
            $user = User::find($staff->user_id);
            if ($user) {
                $currentRole = $user->getRoleNames()->first() ?? '';
            }
        }

        return Inertia::render('Admin/Staff/Edit', [
            'staff' => $staff,
            'departments' => Department::where('is_active', true)->where($globalFilter)->get(),
            'designations' => Designation::where('is_active', true)->where($globalFilter)->get(),
            'roles' => Role::where('name', '!=', 'super_admin')->get(),
            'currentRole' => $currentRole
        ]);
    }

    public function update(Request $request, $id)
    {
        $campusId = config('app.active_campus_id');
        $filter = fn($q) => $campusId ? $q->where('campus_id', $campusId) : $q;

        $staff = Staff::where($filter)->findOrFail($id);
        $request->validate($this->staffValidationRules(isUpdate: true, staffId: $staff->id));

        DB::beginTransaction();
        try {
            $photoPath = $staff->photo;
            if ($request->hasFile('photo')) {
                if ($staff->photo && Storage::disk('public')->exists($staff->photo)) {
                    Storage::disk('public')->delete($staff->photo);
                }
                $photoPath = $request->file('photo')->store('staffs', 'public');
            }

            $staff->update([
                'department_id'     => $request->department_id,
                'designation_id'    => $request->designation_id,
                'first_name'        => $request->first_name,
                'last_name'         => $request->last_name,
                'father_name'       => $request->father_name,
                'mother_name'       => $request->mother_name,
                'gender'            => $request->gender,
                'date_of_birth'     => $request->date_of_birth,
                'joining_date'      => $request->joining_date,
                'phone'             => $request->phone,
                'emergency_phone'   => $request->emergency_phone,
                'email'             => $request->email,
                'marital_status'    => $request->marital_status,
                'blood_group'       => $request->blood_group,
                'present_address'   => $request->present_address,
                'permanent_address' => $request->permanent_address,
                'qualification'     => $request->qualification,
                'experience'        => $request->experience,
                'basic_salary'      => $request->basic_salary,
                'photo'             => $photoPath,
                'is_active'         => $request->is_active,
            ]);

            if ($staff->user_id) {
                $user = User::find($staff->user_id);
                if ($user) {
                    $user->update([
                        'name' => $request->first_name . ' ' . $request->last_name,
                        'email' => $request->email ?? $user->email,
                        'campus_id' => $staff->campus_id ?? $request->user()->campus_id,
                    ]);

                    if ($request->role_name) {
                        $user->syncRoles([$request->role_name]);
                    }
                }
            }

            DB::commit();
            return redirect()->route('admin.staff.index')->with('success', 'স্টাফের তথ্য সফলভাবে আপডেট হয়েছে!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'আপডেট করতে সমস্যা হয়েছে: ' . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        $campusId = config('app.active_campus_id');
        $filter = fn($q) => $campusId ? $q->where('campus_id', $campusId) : $q;

        $staff = Staff::where($filter)->findOrFail($id);

        DB::beginTransaction();
        try {
            if ($staff->user_id) {
                User::where('id', $staff->user_id)->delete();
            }

            if ($staff->photo && Storage::disk('public')->exists($staff->photo)) {
                Storage::disk('public')->delete($staff->photo);
            }

            $staff->delete();

            DB::commit();
            return back()->with('success', 'স্টাফ এবং তার অ্যাকাউন্ট মুছে ফেলা হয়েছে!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'ডিলিট করতে সমস্যা হয়েছে: ' . $e->getMessage());
        }
    }

    public function report($id)
    {
        $campusId = config('app.active_campus_id');
        $filter = fn($q) => $campusId ? $q->where('campus_id', $campusId) : $q;

        $staff = Staff::where($filter)->with(['campus','department','designation'])->findOrFail($id);

        return Inertia::render('Admin/Documents/PersonReport',[
            'personType'=>'staff',
            'person'=>$staff,
            'initialTab'=>request('tab','attendance'),
            'attendance'=>$staff->attendances()->latest('date')->get(),
            'results'=>[],
            'fees'=>[],
            'leaves'=>$staff->leaves()->latest()->get(),
            'payrolls'=>$staff->payrolls()->latest()->get(),
            'hrRecords'=>$staff->hrRecords()->latest()->get()
        ]);
    }

    public function generateIdCard($id)
    {
        $campusId = config('app.active_campus_id');
        $filter = fn($q) => $campusId ? $q->where('campus_id', $campusId) : $q;

        $staff = Staff::where($filter)->with(['campus','department','designation'])->findOrFail($id);

        $template = \App\Models\IdCardTemplate::where('is_active',true)->whereIn('audience',['staff','both'])->latest()->first();
        abort_unless($template, 422, 'Create an active Staff ID card template first.');

        return Inertia::render('Admin/Documents/PersonIdCard',[
            'personType'=>'staff',
            'person'=>$staff,
            'template'=>$template,
            'branding'=>app(\App\Services\WebsiteSettingsService::class)->values()
        ]);
    }

    private function existsRule(string $table)
    {
        $campusId = config('app.active_campus_id');
        return Rule::exists($table, 'id')->where(function ($query) use ($campusId) {
            if ($campusId) {
                $query->where('campus_id', $campusId)->orWhereNull('campus_id');
            }
        });
    }

    private function staffValidationRules(bool $isUpdate = false, $staffId = null): array
    {
        $phoneRule = $isUpdate ? "required|string|max:20|unique:staff,phone,{$staffId}" : 'required|string|max:20|unique:staff,phone';
        $emailRule = $isUpdate ? "nullable|email|unique:staff,email,{$staffId}" : 'nullable|email|unique:staff,email';

        return [
            'department_id'     => ['required', $this->existsRule('departments')],
            'designation_id'    => ['required', $this->existsRule('designations')],
            'first_name'        => 'required|string|max:255',
            'last_name'         => 'nullable|string|max:255',
            'father_name'       => 'nullable|string|max:255',
            'mother_name'       => 'nullable|string|max:255',
            'gender'            => 'required|in:male,female,other',
            'date_of_birth'     => 'required|date',
            'joining_date'      => 'required|date',
            'phone'             => $phoneRule,
            'emergency_phone'   => 'nullable|string|max:20',
            'email'             => $emailRule,
            'marital_status'    => 'nullable|string|max:50',
            'blood_group'       => 'nullable|string|max:10',
            'present_address'   => 'required|string',
            'permanent_address' => 'required|string',
            'qualification'     => 'nullable|string|max:255',
            'experience'        => 'nullable|string|max:255',
            'basic_salary'      => 'required|numeric|min:0',
            'photo'             => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'is_active'         => 'nullable|boolean',
        ];
    }
}
