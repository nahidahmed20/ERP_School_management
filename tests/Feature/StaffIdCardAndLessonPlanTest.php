<?php

namespace Tests\Feature;

use App\Models\Campus;
use App\Models\Department;
use App\Models\Designation;
use App\Models\SchoolClass;
use App\Models\Staff;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class StaffIdCardAndLessonPlanTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_id_card_without_a_staff_template_redirects_to_staff_template_creation(): void
    {
        [$admin, $campus] = $this->adminForCampus();
        $department = Department::create(['campus_id' => $campus->id, 'name' => 'Academic']);
        $designation = Designation::create(['campus_id' => $campus->id, 'name' => 'Teacher']);
        $staff = Staff::create([
            'campus_id' => $campus->id,
            'department_id' => $department->id,
            'designation_id' => $designation->id,
            'staff_id_no' => 'EMP-TEST-0001',
            'first_name' => 'Test',
            'gender' => 'male',
            'date_of_birth' => '1990-01-01',
            'joining_date' => '2026-01-01',
            'phone' => '01700000001',
            'present_address' => 'Dhaka',
            'permanent_address' => 'Dhaka',
        ]);

        $this->actingAs($admin)->withSession(['active_campus_id' => $campus->id])
            ->get(route('admin.staff.id-card', $staff))
            ->assertRedirect(route('admin.documents.idcards.create', ['audience' => 'staff']))
            ->assertSessionHas('error');

        $this->actingAs($admin)->withSession(['active_campus_id' => $campus->id])
            ->get(route('admin.documents.idcards.create', ['audience' => 'staff']))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Documents/IdCards/Form')
                ->where('initialAudience', 'staff'));
    }

    public function test_lesson_plan_page_includes_subjects_assigned_to_each_class(): void
    {
        [$admin, $campus] = $this->adminForCampus();
        $class = SchoolClass::create([
            'campus_id' => $campus->id,
            'name' => 'Class One',
            'is_active' => true,
        ]);
        $subject = Subject::create([
            'campus_id' => $campus->id,
            'name' => 'Mathematics',
            'code' => 'MATH',
            'is_active' => true,
        ]);
        $class->subjects()->attach($subject);

        $this->actingAs($admin)->withSession(['active_campus_id' => $campus->id])
            ->get(route('admin.lesson-plans.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/AcademicsLessons/Index')
                ->where('classes.0.id', $class->id)
                ->where('classes.0.subjects.0.id', $subject->id));
    }

    public function test_lesson_plan_rejects_a_subject_not_assigned_to_the_selected_class(): void
    {
        [$admin, $campus] = $this->adminForCampus();
        $class = SchoolClass::create([
            'campus_id' => $campus->id,
            'name' => 'Class One',
            'is_active' => true,
        ]);
        $otherClass = SchoolClass::create([
            'campus_id' => $campus->id,
            'name' => 'Class Two',
            'is_active' => true,
        ]);
        $subject = Subject::create([
            'campus_id' => $campus->id,
            'name' => 'Mathematics',
            'code' => 'MATH',
            'is_active' => true,
        ]);
        $otherClass->subjects()->attach($subject);

        $this->actingAs($admin)->withSession(['active_campus_id' => $campus->id])
            ->post(route('admin.lesson-plans.store'), [
                'class_id' => $class->id,
                'subject_id' => $subject->id,
                'title' => 'Chapter One',
                'status' => 'Pending',
            ])
            ->assertSessionHasErrors('subject_id');

        $this->assertDatabaseMissing('lesson_plans', ['title' => 'Chapter One']);
    }

    private function adminForCampus(): array
    {
        config(['app.active_campus_id' => null]);
        $campus = Campus::create([
            'name' => 'Test Campus',
            'code' => 'TEST',
            'is_active' => true,
        ]);
        $admin = User::factory()->create(['campus_id' => null]);
        $admin->assignRole(Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']));

        return [$admin, $campus];
    }
}
