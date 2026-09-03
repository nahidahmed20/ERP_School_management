<?php

namespace Tests\Feature;

use App\Models\{Campus, Guardian, ParentConsent, SmsLog, Student, StudentClearance, StudentTransfer, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class StudentGuardianWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_guardian_can_verify_phone_and_save_emergency_preferences(): void
    {
        [$campus, $user, $guardian] = $this->guardianAccount('A');
        $this->actingAs($user)->post(route('portal.parent.otp.send'))->assertRedirect();
        preg_match('/\b(\d{6})\b/', SmsLog::latest()->value('message'), $matches);
        $this->actingAs($user)->post(route('portal.parent.otp.verify'), ['otp' => $matches[1]])->assertRedirect();
        $this->actingAs($user)->patch(route('portal.parent.preferences'), ['sms' => true, 'email' => false, 'push' => true, 'attendance' => true, 'results' => false, 'fees' => true, 'emergency_contact_name' => 'Emergency Person', 'emergency_contact_phone' => '01700000001', 'emergency_priority' => 2])->assertRedirect();
        $guardian->refresh();
        $this->assertNotNull($guardian->phone_verified_at);
        $this->assertSame('Emergency Person', $guardian->emergency_contact_name);
        $this->assertSame(2, $guardian->emergency_priority);
        $this->assertFalse($guardian->notification_preferences['email']);
    }

    public function test_consent_is_tenant_safe_and_records_signed_response(): void
    {
        [$campus, $user, $guardian] = $this->guardianAccount('B');
        $student = $this->student($campus, $guardian, 'B-1');
        $consent = ParentConsent::create(['campus_id' => $campus->id, 'student_id' => $student->id, 'guardian_id' => $guardian->id, 'consent_type' => 'trip', 'title' => 'Study tour']);
        $this->actingAs($user)->patch(route('portal.parent.consents.respond', $consent), ['is_granted' => true, 'signature_name' => 'Parent Name'])->assertRedirect();
        $this->assertDatabaseHas('parent_consents', ['id' => $consent->id, 'is_granted' => true, 'signature_name' => 'Parent Name']);

        $otherCampus = Campus::create(['name' => 'Other', 'code' => 'OTHER']);
        config(['app.active_campus_id' => $otherCampus->id]);
        $this->assertSame(0, ParentConsent::count());
    }

    public function test_transfer_finishes_only_after_every_department_clears(): void
    {
        [$campus, $guardianUser, $guardian] = $this->guardianAccount('C');
        $student = $this->student($campus, $guardian, 'C-1');
        $transfer = StudentTransfer::create(['campus_id' => $campus->id, 'student_id' => $student->id, 'type' => 'transfer', 'effective_date' => today(), 'reason' => 'Moving', 'status' => 'clearance_pending']);
        foreach (['Accounts', 'Library', 'Transport', 'Hostel', 'Academic'] as $department) StudentClearance::create(['campus_id' => $campus->id, 'student_id' => $student->id, 'student_transfer_id' => $transfer->id, 'department' => $department, 'status' => 'pending', 'amount_due' => 0]);
        StudentClearance::where('student_transfer_id', $transfer->id)->take(4)->update(['status' => 'cleared', 'cleared_at' => now()]);
        $this->assertTrue($student->fresh()->status);

        $admin = User::factory()->create(['campus_id' => $campus->id]);
        $admin->givePermissionTo(Permission::create(['name' => 'admin.students.clearances.update', 'guard_name' => 'web']));
        $last = StudentClearance::where('student_transfer_id', $transfer->id)->where('status', 'pending')->firstOrFail();
        $this->actingAs($admin)->patch(route('admin.students.clearances.update', $last), ['status' => 'cleared', 'amount_due' => 0])->assertRedirect();
        $this->assertSame('completed', $transfer->fresh()->status);
        $this->assertFalse($student->fresh()->status);
    }

    private function guardianAccount(string $suffix): array
    {
        $campus = Campus::create(['name' => "Campus {$suffix}", 'code' => "C{$suffix}"]);
        config(['app.active_campus_id' => $campus->id]);
        $user = User::factory()->create(['campus_id' => $campus->id]);
        $guardian = Guardian::create(['campus_id' => $campus->id, 'user_id' => $user->id, 'father_name' => 'Parent Name', 'father_phone' => '01700000000', 'mother_name' => 'Mother Name']);
        return [$campus, $user, $guardian];
    }

    private function student(Campus $campus, Guardian $guardian, string $admission): Student
    {
        return Student::create(['campus_id' => $campus->id, 'guardian_id' => $guardian->id, 'admission_no' => $admission, 'admission_date' => today(), 'first_name' => 'Student', 'gender' => 'male', 'date_of_birth' => today()->subYears(10), 'present_address' => 'Dhaka', 'permanent_address' => 'Dhaka', 'status' => true]);
    }
}
