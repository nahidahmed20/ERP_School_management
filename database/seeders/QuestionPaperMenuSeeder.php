<?php

namespace Database\Seeders;

use App\Models\MenuGroup;
use App\Models\MenuItem;
use App\Services\MenuOrderService;
use Illuminate\Database\Seeder;

class QuestionPaperMenuSeeder extends Seeder
{
    public function run(): void
    {
        $group=MenuGroup::firstOrCreate(['label'=>'Learning'],['order'=>6,'is_active'=>true]);
        $parent=MenuItem::firstOrCreate(['key'=>'lms'],['menu_group_id'=>$group->id,'label'=>'LMS & Online Exams','icon'=>'laptop','order'=>0,'is_active'=>true]);
        MenuItem::updateOrCreate(['key'=>'admin.lms.question-papers.index'],[
            'menu_group_id'=>$group->id,'parent_id'=>$parent->id,'label'=>'Question Paper Generator','route_name'=>'admin.lms.question-papers.index',
            'permission'=>'admin.lms.question-papers.index','order'=>6,'is_active'=>true,
        ]);
        $parent->update(['badge_count'=>$parent->children()->count()]);
        app(MenuOrderService::class)->apply();
    }
}
