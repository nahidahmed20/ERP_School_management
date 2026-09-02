<?php
namespace Database\Seeders;
use App\Models\MenuItem;
use Illuminate\Database\Seeder;
class StudentPortalMenuSeeder extends Seeder { public function run():void { $parent=MenuItem::where('key','students')->first(); if(!$parent)return; MenuItem::firstOrCreate(['key'=>'admin.student-services.index'],['menu_group_id'=>$parent->menu_group_id,'parent_id'=>$parent->id,'label'=>'Student Service Reviews','route_name'=>'admin.student-services.index','permission'=>'admin.student-services.index','order'=>$parent->children()->max('order')+1,'is_active'=>true]); } }
