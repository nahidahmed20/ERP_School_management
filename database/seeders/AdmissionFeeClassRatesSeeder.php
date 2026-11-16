<?php

namespace Database\Seeders;

use App\Models\AcademicSession;
use App\Models\FeeGroup;
use App\Models\FeeGroupClassRate;
use App\Models\FeeType;
use App\Models\SchoolClass;
use Illuminate\Database\Seeder;

class AdmissionFeeClassRatesSeeder extends Seeder
{
    public function run(): void
    {
        $classNames = [
            'Play Group', 'Nursery', 'Kindergarten (KG)',
            'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6',
            'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12',
        ];
        $feeGroup = FeeGroup::firstOrCreate(
            ['name' => 'Admission Fee'],
            ['description' => 'One-time admission fee with class-specific rates.', 'is_active' => true],
        );
        FeeType::firstOrCreate(
            ['fee_group_id' => $feeGroup->id, 'name' => 'Admission Fee'],
            ['amount' => 0, 'description' => 'The applicable amount is set by class.', 'is_active' => true],
        );
        $sessions = AcademicSession::where('is_current', true)->get();

        foreach ($sessions as $session) {
            foreach ($classNames as $index => $className) {
                $schoolClass = SchoolClass::where('campus_id', $session->campus_id)
                    ->where('name', $className)
                    ->first();

                if (! $schoolClass) {
                    continue;
                }

                FeeGroupClassRate::updateOrCreate([
                    'fee_group_id' => $feeGroup->id,
                    'school_class_id' => $schoolClass->id,
                    'academic_session_id' => $session->id,
                ], ['amount' => 800 + ($index * 100)]);
            }
        }
    }
}
