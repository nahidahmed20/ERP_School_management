<?php

namespace Database\Seeders;

use App\Models\FeeGroup;
use Illuminate\Database\Seeder;

class StandardSchoolFeeCatalogSeeder extends Seeder
{
    /**
     * Store canonical English labels so the locale catalog can render either language.
     * Existing Bengali labels are renamed in place and configured amounts are preserved.
     */
    public function run(): void
    {
        $catalog = [
            'Admission Fee' => ['বাংলা' => 'ভর্তি ফি', 'fees' => [['Admission Fee', 'ভর্তি ফি']]],
            'Academic Year & Re-enrollment' => [
                'বাংলা' => 'পুনঃভর্তি ও শিক্ষাবর্ষ',
                'fees' => [['Re-enrollment Fee', 'পুনঃভর্তি ফি'], ['Academic Year Registration Fee', 'শিক্ষাবর্ষ নিবন্ধন ফি']],
            ],
            'First Term Examination' => ['বাংলা' => 'প্রথম সাময়িক পরীক্ষা', 'fees' => [['First Term Examination Fee', 'প্রথম সাময়িক পরীক্ষা ফি']]],
            'Second Term Examination' => ['বাংলা' => 'দ্বিতীয় সাময়িক পরীক্ষা', 'fees' => [['Second Term Examination Fee', 'দ্বিতীয় সাময়িক পরীক্ষা ফি']]],
            'Annual Examination' => ['বাংলা' => 'বার্ষিক পরীক্ষা', 'fees' => [['Annual Examination Fee', 'বার্ষিক পরীক্ষা ফি']]],
            'Model Test' => ['বাংলা' => 'মডেল টেস্ট', 'fees' => [['Model Test Fee', 'মডেল টেস্ট ফি']]],
            'Annual Sports Event' => ['বাংলা' => 'বার্ষিক ক্রীড়া অনুষ্ঠান', 'fees' => [['Annual Sports Event Fee', 'বার্ষিক ক্রীড়া অনুষ্ঠান ফি']]],
            'Cultural Program' => ['বাংলা' => 'সাংস্কৃতিক অনুষ্ঠান', 'fees' => [['Cultural Program Fee', 'সাংস্কৃতিক অনুষ্ঠান ফি']]],
            'Educational Trip' => ['বাংলা' => 'শিক্ষা সফর', 'fees' => [['Educational Trip Fee', 'শিক্ষা সফর ফি']]],
            'Science Fair & Exhibition' => ['বাংলা' => 'বিজ্ঞান মেলা ও প্রদর্শনী', 'fees' => [['Science Fair/Exhibition Fee', 'বিজ্ঞান মেলা/প্রদর্শনী ফি']]],
            'Annual Ceremony' => ['বাংলা' => 'বার্ষিক অনুষ্ঠান', 'fees' => [['Annual Ceremony Fee', 'বার্ষিক অনুষ্ঠান ফি']]],
            'Library Services' => ['বাংলা' => 'লাইব্রেরি সুবিধা', 'fees' => [['Library Fee', 'লাইব্রেরি ফি']]],
            'Science Laboratory' => ['বাংলা' => 'বিজ্ঞানাগার সুবিধা', 'fees' => [['Science Laboratory Fee', 'বিজ্ঞানাগার ফি']]],
            'Computer & ICT Facilities' => ['বাংলা' => 'কম্পিউটার ও আইসিটি সুবিধা', 'fees' => [['Computer/ICT Lab Fee', 'কম্পিউটার/আইসিটি ল্যাব ফি']]],
            'Learning Materials' => ['বাংলা' => 'শিক্ষাসামগ্রী', 'fees' => [['Student Diary Fee', 'শিক্ষার্থী ডায়েরি ফি'], ['Learning Materials Fee', 'শিক্ষাসামগ্রী ফি']]],
            'Student ID Cards' => ['বাংলা' => 'পরিচয়পত্র', 'fees' => [['Student ID Card Fee', 'পরিচয়পত্র ফি'], ['ID Card Reissue Fee', 'পরিচয়পত্র পুনঃইস্যু ফি']]],
            'Transportation' => ['বাংলা' => 'পরিবহন', 'fees' => [['Transportation Fee', 'পরিবহন ফি']]],
            'Extracurricular Activities' => ['বাংলা' => 'সহশিক্ষা কার্যক্রম', 'fees' => [['Club & Extracurricular Activity Fee', 'ক্লাব ও সহশিক্ষা কার্যক্রম ফি']]],
            'Certificates & Documents' => ['বাংলা' => 'প্রত্যয়নপত্র ও নথি', 'fees' => [['Certificate Fee', 'প্রত্যয়নপত্র/সনদ ফি']]],
        ];

        foreach ($catalog as $englishGroup => $definition) {
            $group = FeeGroup::query()
                ->whereIn('name', [$englishGroup, $definition['বাংলা']])
                ->first();

            if (! $group) {
                $group = FeeGroup::create([
                    'name' => $englishGroup,
                    'description' => 'Set the school-approved amount before assigning this fee.',
                    'is_active' => true,
                ]);
            } else {
                $updates = [];
                if ($group->name !== $englishGroup) {
                    $updates['name'] = $englishGroup;
                }
                if ($group->description === 'ফি ধার্য করার আগে প্রতিষ্ঠানের নির্ধারিত পরিমাণ বসান।') {
                    $updates['description'] = 'Set the school-approved amount before assigning this fee.';
                }
                if ($updates) {
                    $group->update($updates);
                }
            }

            foreach ($definition['fees'] as [$englishFee, $bengaliFee]) {
                $feeType = $group->feeTypes()->whereIn('name', [$englishFee, $bengaliFee])->first();

                if (! $feeType) {
                    $group->feeTypes()->create([
                        'name' => $englishFee,
                        'amount' => 0,
                        'description' => 'Set the school-approved amount before assigning this fee.',
                        'is_active' => true,
                    ]);
                } else {
                    $updates = [];
                    if ($feeType->name !== $englishFee) {
                        $updates['name'] = $englishFee;
                    }
                    if ($feeType->description === 'পরিমাণ স্কুল কর্তৃপক্ষ নির্ধারণ করবেন।') {
                        $updates['description'] = 'Set the school-approved amount before assigning this fee.';
                    }
                    if ($updates) {
                        $feeType->update($updates);
                    }
                }
            }
        }
    }
}
