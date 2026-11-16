<?php

namespace Tests\Feature;

use App\Models\AcademicSession;
use App\Models\Campus;
use App\Models\CertificateTemplate;
use App\Models\Department;
use App\Models\Designation;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Staff;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class CampusResourceCreationTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_creation_keeps_related_records_in_the_selected_campus_and_numbers_unique_across_campuses(): void
    {
        [$admin, $main, $branch] = $this->campusAdministrator();
        Bus::fake();
        Role::create(['name' => 'student', 'guard_name' => 'web']);
        Role::create(['name' => 'parent', 'guard_name' => 'web']);

        foreach ([$main, $branch, $main] as $index => $campus) {
            config(['app.active_campus_id' => $campus->id]);
            $session = AcademicSession::firstOrCreate(['campus_id' => $campus->id], [
                'name' => '2026', 'start_date' => '2026-01-01', 'end_date' => '2026-12-31',
                'is_current' => true, 'is_active' => true,
            ]);
            $class = SchoolClass::firstOrCreate(['campus_id' => $campus->id], ['name' => 'Class One']);
            $section = Section::firstOrCreate(['campus_id' => $campus->id], ['name' => 'Section A']);

            $this->actingAs($admin)->withSession(['active_campus_id' => $campus->id])
                ->post(route('admin.students.store'), [
                    'class_id' => $class->id, 'section_id' => $section->id,
                    'first_name' => 'Student '.$index, 'gender' => 'male',
                    'date_of_birth' => '2016-01-01', 'admission_date' => '2026-09-01',
                    'nationality' => 'Bangladeshi', 'present_address' => 'Dhaka', 'permanent_address' => 'Dhaka',
                    'father_name' => 'Father '.$index, 'father_phone' => '0170000000'.$index,
                    'mother_name' => 'Mother '.$index, 'create_student_user' => true, 'create_parent_user' => true,
                ])->assertRedirect(route('admin.students.index'))->assertSessionHasNoErrors()->assertSessionMissing('error');

            $student = Student::withoutGlobalScope('campus')->where('first_name', 'Student '.$index)->firstOrFail();
            $this->assertSame($campus->id, (int) $student->campus_id);
            $this->assertSame($campus->id, (int) $student->guardian->campus_id);
            $this->assertSame($campus->id, (int) $student->guardian->user->campus_id);
            $this->assertSame($campus->id, (int) $student->user->campus_id);
            $this->assertSame($campus->id, (int) $student->currentEnrollment->campus_id);
            $this->assertSame($session->id, (int) $student->currentEnrollment->academic_session_id);
            $this->assertSame('STU-'.date('Y').'-'.sprintf('%04d', $index + 1), $student->admission_no);
        }

        $this->assertSame(3, Student::withoutGlobalScope('campus')->count());
    }

    public function test_staff_creation_uses_selected_campus_for_staff_and_account_and_unique_numbers_across_campuses(): void
    {
        [$admin, $main, $branch] = $this->campusAdministrator();
        Role::create(['name' => 'teacher', 'guard_name' => 'web']);

        foreach ([$main, $branch, $main] as $index => $campus) {
            config(['app.active_campus_id' => $campus->id]);
            $department = Department::firstOrCreate(['campus_id' => $campus->id], ['name' => 'Academics']);
            $designation = Designation::firstOrCreate(['campus_id' => $campus->id], ['name' => 'Teacher']);

            $this->actingAs($admin)->withSession(['active_campus_id' => $campus->id])
                ->post(route('admin.staff.store'), [
                    'department_id' => $department->id, 'designation_id' => $designation->id,
                    'first_name' => 'Teacher '.$index, 'gender' => 'female', 'date_of_birth' => '1990-01-01',
                    'joining_date' => '2026-09-01', 'phone' => '0180000000'.$index,
                    'present_address' => 'Dhaka', 'permanent_address' => 'Dhaka', 'basic_salary' => 10000,
                    'create_user_account' => true, 'role_name' => 'teacher',
                ])->assertRedirect(route('admin.staff.index'))->assertSessionHasNoErrors()->assertSessionMissing('error');

            $staff = Staff::withoutGlobalScope('campus')->where('first_name', 'Teacher '.$index)->firstOrFail();
            $this->assertSame($campus->id, (int) $staff->campus_id);
            $this->assertSame($campus->id, (int) $staff->user->campus_id);
            $this->assertSame('EMP-'.date('Y').'-'.sprintf('%04d', $index + 1), $staff->staff_id_no);
        }

        $this->assertSame(3, Staff::withoutGlobalScope('campus')->count());
    }

    public function test_document_templates_and_generated_certificates_use_the_selected_campus_when_form_omits_it(): void
    {
        [$admin, , $branch] = $this->campusAdministrator();
        $this->actingAs($admin)->withSession(['active_campus_id' => $branch->id]);
        $certificateData = [
            'title' => 'Branch Certificate', 'template_type' => 'character', 'design_style' => 'classic',
            'content_body' => 'This certifies {{name}}', 'is_active' => true,
        ];

        $this->post(route('admin.documents.certificatetemplates.store'), $certificateData)
            ->assertRedirect()->assertSessionHasNoErrors();
        $template = CertificateTemplate::withoutGlobalScope('campus')->where('title', 'Branch Certificate')->firstOrFail();
        $this->assertSame($branch->id, (int) $template->campus_id);

        $this->put(route('admin.documents.certificatetemplates.update', $template), $certificateData + ['signature_1_title' => 'Head'])
            ->assertRedirect()->assertSessionHasNoErrors();
        $this->assertSame($branch->id, (int) $template->fresh()->campus_id);

        $this->post(route('admin.documents.transcripts.store'), [
            'title' => 'Branch Transcript', 'grading_system' => 'GPA', 'is_active' => true,
        ])->assertRedirect()->assertSessionHasNoErrors();
        $this->assertDatabaseHas('transcript_templates', ['title' => 'Branch Transcript', 'campus_id' => $branch->id]);

        $studentAccount = User::factory()->create(['campus_id' => $branch->id]);
        $this->post(route('admin.documents.certificates.store'), [
            'certificate_template_id' => $template->id, 'user_id' => $studentAccount->id, 'issue_date' => '2026-09-01',
        ])->assertRedirect()->assertSessionHasNoErrors();
        $this->assertDatabaseHas('generated_certificates', ['user_id' => $studentAccount->id, 'campus_id' => $branch->id]);
    }

    public function test_student_create_form_exposes_only_the_selected_campus(): void
    {
        [$admin, , $branch] = $this->campusAdministrator();

        $this->actingAs($admin)->withSession(['active_campus_id' => $branch->id])
            ->get(route('admin.students.create'))
            ->assertOk()->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Students/Create')
                ->where('activeCampusId', $branch->id)
                ->has('campuses', 1)->where('campuses.0.id', $branch->id));
    }

    public function test_department_and_designation_creation_support_a_super_admin_without_an_account_campus(): void
    {
        [$admin, , $branch] = $this->campusAdministrator();
        $this->actingAs($admin)->withSession(['active_campus_id' => $branch->id]);

        foreach (['departments', 'designations'] as $resource) {
            $this->post(route('admin.'.$resource.'.store'), ['name' => 'Branch '.$resource, 'is_active' => true])
                ->assertRedirect()->assertSessionHasNoErrors();
            $this->assertDatabaseHas($resource, ['name' => 'Branch '.$resource, 'campus_id' => $branch->id]);
        }
    }

    private function campusAdministrator(): array
    {
        config(['app.active_campus_id' => null]);
        $main = Campus::create(['name' => 'Main Campus', 'code' => 'MAIN', 'is_main' => true]);
        $branch = Campus::create(['name' => 'Branch Campus', 'code' => 'BRANCH']);
        $admin = User::factory()->create(['campus_id' => null]);
        $admin->assignRole(Role::create(['name' => 'Super Admin', 'guard_name' => 'web']));

        return [$admin, $main, $branch];
    }
}
