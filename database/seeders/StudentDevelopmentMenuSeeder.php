<?php

namespace Database\Seeders;

use App\Models\MenuGroup;
use App\Models\MenuItem;
use App\Services\MenuOrderService;
use Illuminate\Database\Seeder;

class StudentDevelopmentMenuSeeder extends Seeder
{
    public function run(): void
    {
        $group = MenuGroup::firstOrCreate(['label'=>'Academics'], ['order'=>2,'is_active'=>true]);
        $parent = MenuItem::firstOrCreate(['key'=>'students'], ['menu_group_id'=>$group->id,'label'=>'Students','icon'=>'cap','order'=>0,'is_active'=>true]);
        MenuItem::updateOrCreate(['key'=>'admin.student-development-records.index'], [
            'menu_group_id'=>$group->id,'parent_id'=>$parent->id,'label'=>'Student Development & Support',
            'route_name'=>'admin.student-development-records.index','permission'=>'admin.student-development-records.index','order'=>7,'is_active'=>true,
        ]);
        $parent->update(['badge_count'=>$parent->children()->count()]);
        app(MenuOrderService::class)->apply();
    }
}
