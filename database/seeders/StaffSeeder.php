<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class StaffSeeder extends Seeder
{
    public function run(): void
    {
        $campusId = config('app.active_campus_id');
        $campusId = $campusId === null ? null : (int) $campusId;
        $departmentId = $this->lookupId('departments', 'Academic', $campusId);
        $designationId = $this->lookupId('designations', 'Teacher', $campusId);

        $teachers = [
            [
                'first_name' => 'মোহাম্মদ',
                'last_name' => 'আব্দুল্লাহ',
                'father_name' => 'মোঃ আব্দুল করিম',
                'mother_name' => 'রোকেয়া বেগম',
                'gender' => 'male',
                'phone' => '01710001001',
                'email' => 'teacher01@example.com',
                'qualification' => 'M.A. in English',
                'experience' => '5 Years',
                'basic_salary' => 25000,
                'blood_group' => 'B+',
                'marital_status' => 'Married',
                'city' => 'Dhaka',
            ],
            [
                'first_name' => 'ফারজানা',
                'last_name' => 'আক্তার',
                'father_name' => 'মোঃ আব্দুল হক',
                'mother_name' => 'সালমা বেগম',
                'gender' => 'female',
                'phone' => '01710001002',
                'email' => 'teacher02@example.com',
                'qualification' => 'M.Sc. in Mathematics',
                'experience' => '4 Years',
                'basic_salary' => 28000,
                'blood_group' => 'A+',
                'marital_status' => 'Married',
                'city' => 'Dinajpur',
            ],
            [
                'first_name' => 'মোঃ',
                'last_name' => 'রাকিব হাসান',
                'father_name' => 'মোঃ আব্দুর রহমান',
                'mother_name' => 'নাসিমা বেগম',
                'gender' => 'male',
                'phone' => '01710001003',
                'email' => 'teacher03@example.com',
                'qualification' => 'M.Sc. in Physics',
                'experience' => '6 Years',
                'basic_salary' => 30000,
                'blood_group' => 'O+',
                'marital_status' => 'Married',
                'city' => 'Rangpur',
            ],
            [
                'first_name' => 'নুসরাত',
                'last_name' => 'জাহান',
                'father_name' => 'মোঃ নজরুল ইসলাম',
                'mother_name' => 'পারভীন আক্তার',
                'gender' => 'female',
                'phone' => '01710001004',
                'email' => 'teacher04@example.com',
                'qualification' => 'M.A. in Bangla',
                'experience' => '3 Years',
                'basic_salary' => 24000,
                'blood_group' => 'AB+',
                'marital_status' => 'Unmarried',
                'city' => 'Rajshahi',
            ],
            [
                'first_name' => 'মোঃ',
                'last_name' => 'সাইফুল ইসলাম',
                'father_name' => 'মোঃ মফিজুল ইসলাম',
                'mother_name' => 'আমেনা বেগম',
                'gender' => 'male',
                'phone' => '01710001005',
                'email' => 'teacher05@example.com',
                'qualification' => 'M.Sc. in Chemistry',
                'experience' => '7 Years',
                'basic_salary' => 32000,
                'blood_group' => 'B-',
                'marital_status' => 'Married',
                'city' => 'Bogura',
            ],
            [
                'first_name' => 'সুমাইয়া',
                'last_name' => 'আক্তার',
                'father_name' => 'মোঃ আবুল কালাম',
                'mother_name' => 'রেহানা বেগম',
                'gender' => 'female',
                'phone' => '01710001006',
                'email' => 'teacher06@example.com',
                'qualification' => 'B.Ed.',
                'experience' => '2 Years',
                'basic_salary' => 22000,
                'blood_group' => 'O-',
                'marital_status' => 'Unmarried',
                'city' => 'Mymensingh',
            ],
            [
                'first_name' => 'মোঃ',
                'last_name' => 'ইমরান হোসেন',
                'father_name' => 'মোঃ শহিদুল ইসলাম',
                'mother_name' => 'শাহানা বেগম',
                'gender' => 'male',
                'phone' => '01710001007',
                'email' => 'teacher07@example.com',
                'qualification' => 'M.Sc. in Biology',
                'experience' => '5 Years',
                'basic_salary' => 27000,
                'blood_group' => 'A-',
                'marital_status' => 'Married',
                'city' => 'Khulna',
            ],
            [
                'first_name' => 'তাসনিম',
                'last_name' => 'তাবাসসুম',
                'father_name' => 'মোঃ জাহাঙ্গীর আলম',
                'mother_name' => 'শিরিন আক্তার',
                'gender' => 'female',
                'phone' => '01710001008',
                'email' => 'teacher08@example.com',
                'qualification' => 'M.A. in English',
                'experience' => '3 Years',
                'basic_salary' => 25000,
                'blood_group' => 'AB-',
                'marital_status' => 'Unmarried',
                'city' => 'Chattogram',
            ],
            [
                'first_name' => 'মোঃ',
                'last_name' => 'মাহমুদুল হাসান',
                'father_name' => 'মোঃ আনোয়ার হোসেন',
                'mother_name' => 'খালেদা বেগম',
                'gender' => 'male',
                'phone' => '01710001009',
                'email' => 'teacher09@example.com',
                'qualification' => 'M.Sc. in Mathematics',
                'experience' => '8 Years',
                'basic_salary' => 35000,
                'blood_group' => 'B+',
                'marital_status' => 'Married',
                'city' => 'Cumilla',
            ],
            [
                'first_name' => 'সাদিয়া',
                'last_name' => 'ইসলাম',
                'father_name' => 'মোঃ আব্দুস সালাম',
                'mother_name' => 'ফাতেমা বেগম',
                'gender' => 'female',
                'phone' => '01710001010',
                'email' => 'teacher10@example.com',
                'qualification' => 'M.Sc. in Computer Science',
                'experience' => '4 Years',
                'basic_salary' => 30000,
                'blood_group' => 'A+',
                'marital_status' => 'Unmarried',
                'city' => 'Sylhet',
            ],
        ];

        $now = now();
        $insertedCount = 0;
        $skippedCount = 0;

        foreach ($teachers as $index => $teacher) {
            $staffIdNo = 'EMP-' . date('Y') . '-' .
                sprintf('%04d', 1001 + $index);

            if (DB::table('staff')->where('staff_id_no', $staffIdNo)
                ->orWhere('phone', $teacher['phone'])
                ->orWhere('email', $teacher['email'])
                ->exists()) {
                $skippedCount++;
                continue;
            }

            $staff = [
                'user_id' => null,
                'department_id' => $departmentId,
                'designation_id' => $designationId,
                'staff_id_no' => $staffIdNo,
                'first_name' => $teacher['first_name'],
                'last_name' => $teacher['last_name'],
                'father_name' => $teacher['father_name'],
                'mother_name' => $teacher['mother_name'],
                'gender' => $teacher['gender'],
                'date_of_birth' => date(
                    'Y-m-d',
                    strtotime('-'.(28 + $index).' years', strtotime('1990-01-01'))
                ),
                'joining_date' => now()->subYears($index + 1)->toDateString(),
                'phone' => $teacher['phone'],
                'emergency_phone' => null,
                'email' => $teacher['email'],
                'marital_status' => $teacher['marital_status'],
                'blood_group' => $teacher['blood_group'],
                'photo' => null,
                'present_address' => 'House 12, Road 5, ' .
                    $teacher['city'] . ', Bangladesh',
                'permanent_address' => 'Village: Uttar Para, ' .
                    $teacher['city'] . ', Bangladesh',
                'qualification' => $teacher['qualification'],
                'experience' => $teacher['experience'],
                'basic_salary' => $teacher['basic_salary'],
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ];

            if (Schema::hasColumn('staff', 'campus_id')) {
                $staff['campus_id'] = $campusId;
            }

            DB::table('staff')->insert($staff);
            $insertedCount++;
        }

        $this->command->info(
            "{$insertedCount} জন শিক্ষকের ডেটা যোগ হয়েছে; {$skippedCount} জন আগে থেকেই ছিলেন।"
        );
    }

    private function lookupId(string $table, string $defaultName, ?int $campusId): int
    {
        $query = DB::table($table);

        if ($campusId === null) {
            $query->whereNull('campus_id');
        } else {
            $query->where('campus_id', $campusId);
        }

        $id = $query->value('id');

        if ($id !== null) {
            return (int) $id;
        }

        return (int) DB::table($table)->insertGetId([
            'campus_id' => $campusId,
            'name' => $defaultName,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
