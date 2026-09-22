<?php

namespace Tests\Feature;

use App\Models\AcademicSession;
use App\Models\Campus;
use App\Models\Enrollment;
use App\Models\Guardian;
use App\Models\SaasPlan;
use App\Models\SaasTenant;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Student;
use App\Models\User;
use App\Services\StudentCsvImporter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class StudentBulkImportTest extends TestCase
{
    use RefreshDatabase;

    public function test_imports_utf8_students_guardians_and_enrollments_into_the_selected_campus_without_accounts(): void
    {
        [$admin, $main, $branch, $row] = $this->fixture();
        $second = array_replace($row, ['first_name' => 'দ্বিতীয় ছাত্র', 'roll_no' => '02']);

        $this->actingAs($admin)->withSession(['active_campus_id' => $branch->id])
            ->post(route('admin.students.import.store'), ['file' => $this->csv([$row, $second]), 'campus_id' => $branch->id])
            ->assertRedirect(route('admin.students.index'))->assertSessionHasNoErrors()->assertSessionHas('success');

        $this->assertDatabaseCount('students', 2);
        $this->assertDatabaseCount('enrollments', 2);
        $this->assertDatabaseCount('guardians', 1);
        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseCount('student_guardians', 2);
        $this->assertDatabaseMissing('students', ['campus_id' => $main->id]);
        $this->assertDatabaseHas('students', ['first_name' => 'দ্বিতীয় ছাত্র', 'campus_id' => $branch->id, 'user_id' => null]);
        foreach (['students', 'guardians', 'enrollments'] as $table) {
            $this->assertSame([$branch->id], DB::table($table)->distinct()->pluck('campus_id')->all());
        }
        $this->assertSame(2, Student::withoutGlobalScope('campus')->distinct()->count('admission_no'));
    }

    public function test_rejects_every_row_before_writing_if_email_admission_or_roll_is_duplicated(): void
    {
        [$admin, , $branch, $row] = $this->fixture();
        $this->actingAs($admin)->withSession(['active_campus_id' => $branch->id]);

        foreach (['email' => 'pupil@example.test', 'admission_no' => 'OLD-001', 'roll_no' => '01'] as $field => $value) {
            $first = array_replace($row, [$field => $value]);
            $second = array_replace($row, ['first_name' => 'Other Pupil', 'roll_no' => '02', $field => $value]);
            $this->post(route('admin.students.import.store'), ['file' => $this->csv([$first, $second])])
                ->assertSessionHasErrors('rows.3.'.$field);
            $this->assertDatabaseCount('students', 0);
            $this->assertDatabaseCount('guardians', 0);
        }
    }

    public function test_rejects_foreign_campus_academic_references_and_guardians(): void
    {
        [$admin, $main, $branch, $row] = $this->fixture();
        config(['app.active_campus_id' => $main->id]);
        $session = AcademicSession::create(['campus_id' => $main->id, 'name' => 'Main session', 'start_date' => '2026-01-01', 'end_date' => '2026-12-31']);
        $class = SchoolClass::create(['name' => 'Main class']);
        $section = Section::create(['name' => 'Main section']);
        $guardian = Guardian::create(['father_name' => 'Other father', 'father_phone' => '01911111111', 'mother_name' => 'Other mother']);
        $foreign = array_replace($row, ['academic_session_id' => $session->id, 'class_id' => $class->id, 'section_id' => $section->id, 'guardian_id' => $guardian->id]);

        $this->actingAs($admin)->withSession(['active_campus_id' => $branch->id])
            ->post(route('admin.students.import.store'), ['file' => $this->csv([$foreign])])
            ->assertSessionHasErrors(['rows.2.academic_session_id', 'rows.2.class_id', 'rows.2.section_id', 'rows.2.guardian_id']);

        $this->assertDatabaseCount('students', 0);
        $this->assertDatabaseCount('enrollments', 0);
    }

    public function test_reuses_an_explicit_guardian_and_rejects_existing_email_admission_and_roll(): void
    {
        [$admin, , $branch, $row] = $this->fixture();
        $guardian = Guardian::create(['campus_id' => $branch->id, 'father_name' => 'Existing father', 'father_phone' => '01911111111', 'mother_name' => 'Existing mother']);
        $row = array_replace($row, ['guardian_id' => $guardian->id, 'father_name' => null, 'father_phone' => null, 'mother_name' => null,
            'admission_no' => 'EXISTING-001', 'email' => 'existing@example.test']);
        $this->actingAs($admin)->withSession(['active_campus_id' => $branch->id]);
        $this->post(route('admin.students.import.store'), ['file' => $this->csv([$row])])->assertSessionHasNoErrors();
        $this->assertDatabaseHas('students', ['guardian_id' => $guardian->id]);
        $this->assertDatabaseCount('guardians', 1);

        $this->post(route('admin.students.import.store'), ['file' => $this->csv([$row])])
            ->assertSessionHasErrors('rows.2.admission_no');
        $this->post(route('admin.students.import.store'), ['file' => $this->csv([array_replace($row, ['admission_no' => 'NEW-001'])])])
            ->assertSessionHasErrors(['rows.2.email', 'rows.2.roll_no']);
        $this->assertDatabaseCount('students', 1);
    }

    public function test_rolls_back_students_and_guardians_if_a_later_enrollment_cannot_be_saved(): void
    {
        [$admin, , $branch, $row] = $this->fixture();
        $enrollmentCount = 0;
        Event::listen('eloquent.creating: '.Enrollment::class, function () use (&$enrollmentCount) {
            if (++$enrollmentCount === 2) {
                throw new \RuntimeException('Simulated enrollment write failure');
            }
        });

        try {
            $this->actingAs($admin)->withSession(['active_campus_id' => $branch->id])
                ->post(route('admin.students.import.store'), ['file' => $this->csv([$row, array_replace($row, ['roll_no' => '02'])])])
                ->assertSessionHasErrors('file');
        } finally {
            Event::forget('eloquent.creating: '.Enrollment::class);
        }

        $this->assertDatabaseCount('students', 0);
        $this->assertDatabaseCount('guardians', 0);
        $this->assertDatabaseCount('enrollments', 0);
        $this->assertDatabaseCount('student_guardians', 0);
    }

    public function test_import_requires_existing_student_store_permission_and_exposes_campus_reference_ids(): void
    {
        [, , $branch, $row] = $this->fixture();
        $operator = User::factory()->create(['campus_id' => $branch->id]);
        $this->actingAs($operator)->get(route('admin.students.import.create'))->assertForbidden();
        $operator->givePermissionTo(Permission::create(['name' => 'admin.students.store', 'guard_name' => 'web']));

        $this->get(route('admin.students.import.create'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Students/Import')->where('campus.id', $branch->id)->has('sessions', 1)->has('classes', 1));
        $this->post(route('admin.students.import.store'), ['file' => $this->csv([$row])])->assertSessionHasNoErrors();
        $this->assertDatabaseCount('students', 1);
    }

    public function test_csv_template_is_utf8_and_invalid_shape_or_excess_rows_import_nothing(): void
    {
        [$admin, , $branch, $row] = $this->fixture();
        $this->actingAs($admin)->withSession(['active_campus_id' => $branch->id]);
        $template = $this->get(route('admin.students.import.template'))->assertOk()->assertDownload('student-import-template.csv');
        $this->assertStringStartsWith("\xEF\xBB\xBFadmission_no,first_name,", $template->streamedContent());

        $this->post(route('admin.students.import.store'), ['file' => UploadedFile::fake()->createWithContent('bad.csv', "name,unexpected\nStudent,1\n")])
            ->assertSessionHasErrors('file');
        $this->post(route('admin.students.import.store'), ['file' => $this->csv(array_fill(0, StudentCsvImporter::MAX_ROWS + 1, $row))])
            ->assertSessionHasErrors('file');
        $this->assertDatabaseCount('students', 0);
    }

    public function test_checks_the_entire_batch_against_existing_tenant_student_capacity(): void
    {
        [, , $branch, $row] = $this->fixture();
        $plan = SaasPlan::create(['name' => 'One student', 'max_students' => 1]);
        $tenant = SaasTenant::create(['company_name' => 'Tenant School', 'domain' => 'tenant.example.test',
            'admin_email' => 'school@example.test', 'saas_plan_id' => $plan->id, 'status' => 'Active']);
        $branch->update(['saas_tenant_id' => $tenant->id]);
        $operator = User::factory()->create(['campus_id' => $branch->id]);
        $operator->givePermissionTo(Permission::create(['name' => 'admin.students.store', 'guard_name' => 'web']));
        $this->actingAs($operator);

        $this->post(route('admin.students.import.store'), ['file' => $this->csv([$row, array_replace($row, ['roll_no' => '02'])])])
            ->assertSessionHasErrors('file');
        $this->assertDatabaseCount('students', 0);
        $this->post(route('admin.students.import.store'), ['file' => $this->csv([$row])])->assertSessionHasNoErrors();
        $this->assertDatabaseCount('students', 1);
        $this->post(route('admin.students.import.store'), ['file' => $this->csv([array_replace($row, ['roll_no' => '02'])])])
            ->assertSessionHasErrors('file');
        $this->assertDatabaseCount('students', 1);
    }

    private function fixture(): array
    {
        config(['app.active_campus_id' => null]);
        $main = Campus::create(['name' => 'Main', 'code' => 'MAIN', 'is_main' => true]);
        $branch = Campus::create(['name' => 'Branch', 'code' => 'BRANCH']);
        $admin = User::factory()->create(['campus_id' => null]);
        $admin->assignRole(Role::create(['name' => 'Super Admin', 'guard_name' => 'web']));
        config(['app.active_campus_id' => $branch->id]);
        $session = AcademicSession::create(['campus_id' => $branch->id, 'name' => '2026', 'start_date' => '2026-01-01', 'end_date' => '2026-12-31', 'is_current' => true]);
        $class = SchoolClass::create(['name' => 'Class One']);
        $section = Section::create(['name' => 'A']);
        $class->sections()->attach($section->id);
        $row = array_fill_keys(StudentCsvImporter::HEADERS, null);
        $row = array_replace($row, [
            'first_name' => 'প্রথম ছাত্র', 'gender' => 'male', 'date_of_birth' => '2016-01-01', 'admission_date' => '2026-09-01',
            'academic_session_id' => $session->id, 'class_id' => $class->id, 'section_id' => $section->id, 'roll_no' => '01',
            'nationality' => 'Bangladeshi', 'present_address' => 'ঢাকা', 'permanent_address' => 'ঢাকা',
            'father_name' => 'Father', 'father_phone' => '01700000001', 'mother_name' => 'Mother',
        ]);

        return [$admin, $main, $branch, $row];
    }

    private function csv(array $rows): UploadedFile
    {
        $handle = fopen('php://temp', 'w+');
        fwrite($handle, "\xEF\xBB\xBF");
        fputcsv($handle, StudentCsvImporter::HEADERS, ',', '"', '');
        foreach ($rows as $row) {
            fputcsv($handle, array_map(fn ($field) => $row[$field] ?? '', StudentCsvImporter::HEADERS), ',', '"', '');
        }
        rewind($handle);
        $contents = stream_get_contents($handle);
        fclose($handle);

        return UploadedFile::fake()->createWithContent('students.csv', $contents);
    }
}
