<?php

namespace Database\Seeders;

use App\Models\SchoolClass;
use App\Models\Subject;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use RuntimeException;

class BangladeshAcademicDataSeeder extends Seeder
{
    /**
     * Seed a configurable, Bangladesh-oriented school class and subject catalog.
     * Existing records are kept; rerunning this seeder only adds missing records
     * and missing class-subject links.
     */
    public function run(): void
    {
        $campuses = DB::table('campuses')->where('is_active', true)->orderBy('id')->get(['id', 'name']);

        if ($campuses->isEmpty()) {
            throw new RuntimeException('Create or activate a campus before seeding Bangladesh academic data.');
        }

        if (! Schema::hasTable('class_subject')) {
            throw new RuntimeException('The class_subject table is missing. Run pending migrations before seeding.');
        }

        $classDefinitions = [
            ['name' => 'Play Group', 'numeric_name' => 0, 'stage' => 'Pre-primary'],
            ['name' => 'Nursery', 'numeric_name' => 0, 'stage' => 'Pre-primary'],
            ['name' => 'Kindergarten (KG)', 'numeric_name' => 0, 'stage' => 'Pre-primary'],
        ];
        for ($grade = 1; $grade <= 12; $grade++) {
            $classDefinitions[] = [
                'name' => "Class {$grade}",
                'numeric_name' => $grade,
                'stage' => $grade <= 5 ? 'Primary' : ($grade <= 10 ? 'Secondary' : 'Higher secondary'),
            ];
        }

        // Codes are stable identifiers for safe, repeatable imports.
        $subjectDefinitions = [
            'BNG' => ['Bangla (বাংলা)', 'Theory'],
            'ENG' => ['English (ইংরেজি)', 'Theory'],
            'MAT' => ['Mathematics (গণিত)', 'Theory'],
            'SCI' => ['Science (বিজ্ঞান)', 'Both'],
            'BGS' => ['Bangladesh and Global Studies (বাংলাদেশ ও বিশ্বপরিচয়)', 'Theory'],
            'ICT' => ['Information and Communication Technology (তথ্য ও যোগাযোগ প্রযুক্তি)', 'Both'],
            'ISL' => ['Islamic Studies (ইসলাম শিক্ষা)', 'Theory'],
            'HIN' => ['Hindu Religion Studies (হিন্দুধর্ম শিক্ষা)', 'Theory'],
            'BUD' => ['Buddhist Religion Studies (বৌদ্ধধর্ম শিক্ষা)', 'Theory'],
            'CHR' => ['Christian Religion Studies (খ্রিষ্টধর্ম শিক্ষা)', 'Theory'],
            'PEH' => ['Physical Education and Health (শারীরিক শিক্ষা ও স্বাস্থ্য)', 'Both'],
            'ART' => ['Arts and Crafts (চারু ও কারুকলা)', 'Both'],
            'WLE' => ['Work and Life-Oriented Education (কর্ম ও জীবনমুখী শিক্ষা)', 'Both'],
            'AGR' => ['Agriculture Studies (কৃষিশিক্ষা)', 'Both'],
            'HSC' => ['Home Science (গার্হস্থ্যবিজ্ঞান)', 'Both'],
            'BLI' => ['Bangla Literature (বাংলা সাহিত্য)', 'Theory'],
            'BGC' => ['Bangla Grammar and Composition (বাংলা ব্যাকরণ ও নির্মিতি)', 'Theory'],
            'EGC' => ['English Grammar and Composition', 'Theory'],
            'CAR' => ['Career Education (ক্যারিয়ার শিক্ষা)', 'Theory'],
            'PHY' => ['Physics (পদার্থবিজ্ঞান)', 'Both'],
            'CHE' => ['Chemistry (রসায়ন)', 'Both'],
            'BIO' => ['Biology (জীববিজ্ঞান)', 'Both'],
            'HMA' => ['Higher Mathematics (উচ্চতর গণিত)', 'Both'],
            'ACC' => ['Accounting (হিসাববিজ্ঞান)', 'Theory'],
            'BOM' => ['Business Organization and Management (ব্যবসায় সংগঠন ও ব্যবস্থাপনা)', 'Theory'],
            'FBI' => ['Finance, Banking and Insurance (ফিন্যান্স, ব্যাংকিং ও বিমা)', 'Theory'],
            'ECO' => ['Economics (অর্থনীতি)', 'Theory'],
            'CIV' => ['Civics and Citizenship (পৌরনীতি ও নাগরিকতা)', 'Theory'],
            'HIS' => ['History of Bangladesh and World Civilization (বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা)', 'Theory'],
            'GEO' => ['Geography and Environment (ভূগোল ও পরিবেশ)', 'Both'],
            'IHC' => ['Islamic History and Culture (ইসলামের ইতিহাস ও সংস্কৃতি)', 'Theory'],
            'LOG' => ['Logic (যুক্তিবিদ্যা)', 'Theory'],
            'SOW' => ['Social Work (সমাজকর্ম)', 'Theory'],
            'MKT' => ['Production Management and Marketing (উৎপাদন ব্যবস্থাপনা ও বিপণন)', 'Theory'],
            'STA' => ['Statistics (পরিসংখ্যান)', 'Both'],
        ];

        $coreSubjectsByClass = [
            'pre_primary' => ['BNG', 'ENG', 'MAT', 'PEH', 'ART'],
            'primary_1_2' => ['BNG', 'ENG', 'MAT'],
            'primary_3_5' => ['BNG', 'ENG', 'MAT', 'SCI', 'BGS'],
            'secondary_6_8' => ['BLI', 'BGC', 'ENG', 'EGC', 'MAT', 'SCI', 'BGS', 'ICT', 'PEH', 'WLE'],
            'secondary_9_10' => ['BLI', 'BGC', 'ENG', 'EGC', 'MAT', 'ICT', 'BGS', 'CAR', 'PEH'],
            'higher_secondary' => ['BNG', 'ENG', 'ICT'],
        ];

        $createdClasses = 0;
        $createdSubjects = 0;
        $createdAssignments = 0;

        DB::transaction(function () use (
            $campuses,
            $classDefinitions,
            $subjectDefinitions,
            $coreSubjectsByClass,
            &$createdClasses,
            &$createdSubjects,
            &$createdAssignments,
        ): void {
            foreach ($campuses as $campus) {
                $subjectIds = [];
                foreach ($subjectDefinitions as $code => [$name, $type]) {
                    $subject = Subject::withoutGlobalScopes()->firstOrCreate(
                        ['campus_id' => $campus->id, 'code' => $code],
                        ['name' => $name, 'type' => $type, 'description' => null, 'is_active' => true],
                    );
                    $subjectIds[$code] = $subject->id;
                    if ($subject->wasRecentlyCreated) $createdSubjects++;
                }

                foreach ($classDefinitions as $definition) {
                    $schoolClass = SchoolClass::withoutGlobalScopes()->firstOrCreate(
                        ['campus_id' => $campus->id, 'name' => $definition['name']],
                        [
                            'numeric_name' => $definition['numeric_name'],
                            'description' => "{$definition['stage']} grade in the Bangladesh school structure.",
                            'is_active' => true,
                        ],
                    );
                    if ($schoolClass->wasRecentlyCreated) $createdClasses++;

                    $codes = match (true) {
                        $definition['numeric_name'] === 0 => $coreSubjectsByClass['pre_primary'],
                        $definition['numeric_name'] <= 2 => $coreSubjectsByClass['primary_1_2'],
                        $definition['numeric_name'] <= 5 => $coreSubjectsByClass['primary_3_5'],
                        $definition['numeric_name'] <= 8 => $coreSubjectsByClass['secondary_6_8'],
                        $definition['numeric_name'] <= 10 => $coreSubjectsByClass['secondary_9_10'],
                        default => $coreSubjectsByClass['higher_secondary'],
                    };

                    foreach ($codes as $code) {
                        $keys = ['class_id' => $schoolClass->id, 'subject_id' => $subjectIds[$code]];
                        $values = Schema::hasColumn('class_subject', 'campus_id')
                            ? ['campus_id' => $campus->id]
                            : [];
                        $created = DB::table('class_subject')->where($keys)->exists();
                        DB::table('class_subject')->updateOrInsert($keys, $values);
                        if (! $created) $createdAssignments++;
                    }
                }
            }
        });

        $this->command?->info("Bangladesh academic catalog ready: {$createdClasses} classes, {$createdSubjects} subjects and {$createdAssignments} class-subject links added.");
    }
}
