<?php

namespace Database\Seeders;

use App\Models\AcademicSession;
use App\Models\Campus;
use App\Models\Enrollment;
use App\Models\Guardian;
use App\Models\SchoolClass;
use App\Models\Staff;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class SchoolLoginAndDemoStudentsSeeder extends Seeder
{
    private const PASSWORD = 'School@2026';

    private const STUDENTS = [
        ['Arafat', 'Hossain', 'male'], ['Nusrat', 'Jahan', 'female'],
        ['Sakib', 'Rahman', 'male'], ['Sumaiya', 'Akter', 'female'],
        ['Tanvir', 'Ahmed', 'male'], ['Mim', 'Sultana', 'female'],
        ['Rafi', 'Islam', 'male'], ['Tanjila', 'Khatun', 'female'],
        ['Fahim', 'Hasan', 'male'], ['Anika', 'Chowdhury', 'female'],
        ['Mahmud', 'Alam', 'male'], ['Sadika', 'Islam', 'female'],
        ['Imran', 'Hossain', 'male'], ['Jannatul', 'Ferdous', 'female'],
        ['Shakil', 'Miah', 'male'], ['Farzana', 'Begum', 'female'],
        ['Nayeem', 'Uddin', 'male'], ['Ayesha', 'Akter', 'female'],
        ['Siam', 'Mahmud', 'male'], ['Rumana', 'Parvin', 'female'],
    ];

    private const PARENTS = [
        ['Abdul Karim', 'Rokeya Begum'], ['Jamal Uddin', 'Salma Begum'],
        ['Abdur Rahman', 'Nasima Akter'], ['Shahidul Islam', 'Rehana Begum'],
        ['Anwar Hossain', 'Khadija Begum'], ['Mizanur Rahman', 'Fatema Akter'],
        ['Kamal Hossain', 'Shirin Akter'], ['Nurul Islam', 'Parvin Begum'],
        ['Rafiqul Islam', 'Hasina Begum'], ['Bashir Ahmed', 'Shahana Akter'],
        ['Abu Taher', 'Lovely Begum'], ['Habibur Rahman', 'Amena Khatun'],
        ['Mostafa Kamal', 'Nasrin Sultana'], ['Jahangir Alam', 'Kohinoor Begum'],
        ['Saidur Rahman', 'Morsheda Begum'], ['Azizul Haque', 'Monowara Begum'],
        ['Delwar Hossain', 'Rashida Begum'], ['Shafiqul Islam', 'Jahanara Begum'],
        ['Abul Kalam', 'Laila Akter'], ['Babul Mia', 'Sabina Yasmin'],
    ];

    public function run(): void
    {
        $campus = Campus::where('is_active', true)->orderBy('id')->first();
        if (! $campus) {
            $this->command?->warn('No active campus found; account and student seeding was skipped.');
            return;
        }

        $staffRole = Role::firstOrCreate(['name' => 'Staff', 'guard_name' => 'web']);
        if (\Spatie\Permission\Models\Permission::where('name', 'dashboard')->where('guard_name', 'web')->exists()) {
            $staffRole->givePermissionTo('dashboard');
        }

        $madeStaffUsers = $this->ensureStaffAccounts($campus->id, $staffRole);
        [$madeStudents, $madeParents] = $this->seedStudents($campus->id);
        $madeRoleUsers = $this->ensureRoleAccounts($campus->id);

        $this->command?->info("Login accounts ready: {$madeStaffUsers} staff accounts, {$madeStudents} demo students, {$madeParents} parent accounts, {$madeRoleUsers} role accounts added.");
        $this->command?->warn('Seed login password for newly created accounts: '.self::PASSWORD);
    }

    private function ensureStaffAccounts(int $campusId, Role $staffRole): int
    {
        $teacherRole = Role::where('name', 'Teacher')->where('guard_name', 'web')->first();
        $created = 0;

        foreach (Staff::withoutGlobalScopes()->orderBy('id')->get() as $staff) {
            $user = $staff->user;
            if (! $user) {
                $email = $staff->email ?: "staff{$staff->id}@example.test";
                if (User::where('email', $email)->exists()) $email = "staff{$staff->id}@example.test";
                $user = User::create([
                    'name' => trim($staff->first_name.' '.$staff->last_name),
                    'email' => $email,
                    'password' => self::PASSWORD,
                    'campus_id' => $campusId,
                    'email_verified_at' => now(),
                ]);
                $staff->user_id = $user->id;
                $staff->save();
                $created++;
            } else {
                $user->forceFill(['password' => self::PASSWORD])->save();
            }

            if (! $staff->campus_id) {
                $staff->campus_id = $campusId;
                $staff->save();
            }

            $designation = Str::lower((string) $staff->designation?->name);
            $user->assignRole(str_contains($designation, 'teacher') && $teacherRole ? $teacherRole : $staffRole);
        }

        return $created;
    }

    private function seedStudents(int $campusId): array
    {
        $session = AcademicSession::withoutGlobalScopes()->where('campus_id', $campusId)->where('is_active', true)->orderByDesc('is_current')->first();
        if (! $session) {
            $session = AcademicSession::create([
                'campus_id' => $campusId, 'name' => (string) now()->year,
                'start_date' => now()->startOfYear()->toDateString(),
                'end_date' => now()->endOfYear()->toDateString(),
                'is_current' => true, 'is_active' => true,
            ]);
        }

        $class = SchoolClass::withoutGlobalScopes()->where('campus_id', $campusId)->where('is_active', true)->orderBy('numeric_name')->first();
        if (! $class) {
            $class = SchoolClass::create(['campus_id' => $campusId, 'name' => 'Class 1', 'numeric_name' => 1, 'is_active' => true]);
        }

        $sectionId = DB::table('class_section')->where('class_id', $class->id)->value('section_id');
        $createdStudents = $createdParents = 0;

        foreach (self::STUDENTS as $index => [$firstName, $lastName, $gender]) {
            $n = $index + 1;
            $parentEmail = sprintf('parent%02d@example.test', $n);
            $studentEmail = sprintf('student%02d@example.test', $n);
            [$fatherName, $motherName] = self::PARENTS[$index];

            $parentUser = User::firstOrCreate(['email' => $parentEmail], [
                'name' => $fatherName, 'password' => self::PASSWORD,
                'campus_id' => $campusId, 'email_verified_at' => now(),
            ]);
            $parentUser->forceFill(['password' => self::PASSWORD, 'campus_id' => $campusId])->save();
            $parentRole = Role::where('name', 'parent')->where('guard_name', 'web')->first();
            if ($parentRole) $parentUser->assignRole($parentRole);

            $guardian = Guardian::firstOrCreate(['guardian_email' => $parentEmail], [
                'user_id' => $parentUser->id, 'campus_id' => $campusId,
                'father_name' => $fatherName, 'father_phone' => sprintf('017%08d', 10000000 + $n),
                'mother_name' => $motherName, 'mother_phone' => sprintf('018%08d', 10000000 + $n),
                'address' => sprintf('House %d, Road 4, Mirpur, Dhaka, Bangladesh', $n + 10),
            ]);
            if (! $guardian->user_id) $guardian->update(['user_id' => $parentUser->id]);
            $createdParents += $parentUser->wasRecentlyCreated ? 1 : 0;

            $studentUser = User::firstOrCreate(['email' => $studentEmail], [
                'name' => trim($firstName.' '.$lastName), 'password' => self::PASSWORD,
                'campus_id' => $campusId, 'email_verified_at' => now(),
            ]);
            $studentUser->forceFill(['password' => self::PASSWORD, 'campus_id' => $campusId])->save();
            $studentRole = Role::where('name', 'student')->where('guard_name', 'web')->first();
            if ($studentRole) $studentUser->assignRole($studentRole);

            $student = Student::firstOrCreate(['admission_no' => sprintf('DEMO-%04d', $n)], [
                'campus_id' => $campusId, 'user_id' => $studentUser->id, 'guardian_id' => $guardian->id,
                'admission_date' => now()->startOfYear()->toDateString(), 'first_name' => $firstName,
                'last_name' => $lastName, 'gender' => $gender,
                'date_of_birth' => now()->subYears(7 + ($index % 7))->subDays($n)->toDateString(),
                'religion' => 'Islam', 'nationality' => 'Bangladeshi', 'phone' => sprintf('019%08d', 10000000 + $n),
                'email' => $studentEmail, 'present_address' => sprintf('House %d, Road 4, Mirpur, Dhaka, Bangladesh', $n + 10),
                'permanent_address' => sprintf('Village Uttar Para, Post Office Mirpur, Dhaka, Bangladesh'),
                'status' => true,
            ]);
            if (! $student->user_id) $student->update(['user_id' => $studentUser->id]);

            Enrollment::firstOrCreate(
                ['student_id' => $student->id, 'academic_session_id' => $session->id, 'is_current' => true],
                ['campus_id' => $campusId, 'class_id' => $class->id, 'section_id' => $sectionId, 'roll_no' => (string) $n],
            );
            if (DB::getSchemaBuilder()->hasTable('student_guardians')) {
                DB::table('student_guardians')->updateOrInsert(
                    ['student_id' => $student->id, 'guardian_id' => $guardian->id],
                    ['relationship' => 'parent', 'is_primary' => true, 'can_pickup' => true, 'receives_sms' => true, 'receives_email' => true, 'created_at' => now(), 'updated_at' => now()],
                );
            }
            $createdStudents += $student->wasRecentlyCreated ? 1 : 0;
        }

        return [$createdStudents, $createdParents];
    }

    private function ensureRoleAccounts(int $campusId): int
    {
        $created = 0;
        foreach (Role::where('guard_name', 'web')->orderBy('id')->get() as $role) {
            if ($role->users()->exists()) {
                $role->users()->get()->each(fn (User $user) => $user->forceFill(['password' => self::PASSWORD])->save());
                continue;
            }
            $slug = Str::slug($role->name);
            $email = "role-{$slug}@example.test";
            $suffix = 1;
            while (User::where('email', $email)->exists()) $email = "role-{$slug}-".++$suffix.'@example.test';
            $user = User::create([
                'name' => $role->name.' Account', 'email' => $email,
                'password' => self::PASSWORD, 'campus_id' => $campusId,
                'email_verified_at' => now(),
            ]);
            $user->assignRole($role);
            $created++;
        }
        return $created;
    }
}
