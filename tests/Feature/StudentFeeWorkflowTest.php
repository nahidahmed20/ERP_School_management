<?php

namespace Tests\Feature;

use App\Http\Controllers\Admin\StudentFeeController;
use App\Models\{AcademicSession, Campus, Enrollment, FeeAssignment, FeeGroup, Invoice, Payment, PaymentTransaction, SchoolClass, Section, Student, User};
use App\Services\{FeeAutomationService, FeePaymentService, SslCommerzService};
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class StudentFeeWorkflowTest extends TestCase
{
    use RefreshDatabase;

    private function setupStudent(): array
    {
        $campus = Campus::create(['name' => 'Fee Campus', 'code' => 'FEE']);
        config(['app.active_campus_id' => $campus->id]);
        $student = Student::create(['campus_id' => $campus->id, 'guardian_id' => 1, 'admission_no' => 'ST-FEE', 'admission_date' => '2026-01-01', 'first_name' => 'Student', 'gender' => 'male', 'date_of_birth' => '2015-01-01', 'present_address' => 'Dhaka', 'permanent_address' => 'Dhaka']);
        $session = AcademicSession::create(['campus_id' => $campus->id, 'name' => '2026', 'start_date' => '2026-01-01', 'end_date' => '2026-12-31', 'is_current' => true]);
        $group = FeeGroup::create(['name' => 'Tuition', 'is_active' => true]);
        return [$campus, $student, $session, $group];
    }

    private function assignment(array $fixture, array $overrides = []): FeeAssignment
    {
        [$campus, $student, $session, $group] = $fixture;
        return FeeAssignment::create(array_merge(['campus_id' => $campus->id, 'student_id' => $student->id, 'fee_group_id' => $group->id, 'academic_session_id' => $session->id, 'amount' => 1000, 'due_date' => '2026-09-01', 'status' => 'unpaid'], $overrides));
    }

    private function invoice(FeeAssignment $assignment, array $overrides = []): Invoice
    {
        return Invoice::create(array_merge(['campus_id' => $assignment->campus_id, 'student_id' => $assignment->student_id, 'fee_group_id' => $assignment->fee_group_id, 'fee_assignment_id' => $assignment->id, 'invoice_no' => 'INV-TEST', 'invoice_date' => '2026-09-01', 'due_date' => '2026-09-30', 'amount' => 1000, 'status' => 'Unpaid'], $overrides));
    }

    public function test_assignment_uses_shared_fee_catalog_creates_invoice_and_preserves_paid_reassignment(): void
    {
        $fixture = $this->setupStudent();
        [, $student, , $group] = $fixture;
        $this->withoutMiddleware();
        $data = ['student_ids' => [$student->id], 'fee_group_id' => $group->id, 'due_date' => '2026-09-01', 'amount' => 1000, 'billing_frequency' => 'one_time', 'discount_type' => 'percentage', 'discount_value' => 10, 'late_fee_type' => 'none', 'late_fee_value' => 0, 'grace_days' => 0];
        $this->post(route('admin.studentfees.store'), $data)->assertSessionHasNoErrors()->assertRedirect();
        $assignment = FeeAssignment::firstOrFail();
        $this->assertDatabaseHas('invoices', ['fee_assignment_id' => $assignment->id, 'amount' => 1000, 'discount' => 100]);
        app(FeePaymentService::class)->receive($assignment, $student->id, 900, ['payment_date' => '2026-09-01', 'payment_method' => 'Cash']);
        $this->post(route('admin.studentfees.store'), array_merge($data, ['amount' => 2000]))->assertSessionHasNoErrors();
        $this->assertDatabaseCount('fee_assignments', 1);
        $this->assertDatabaseCount('invoices', 1);
        $this->assertSame('paid', $assignment->fresh()->status);
        $this->assertEquals(1000, $assignment->fresh()->amount);
    }

    public function test_assignment_does_not_use_another_campuses_current_session(): void
    {
        $fixture = $this->setupStudent();
        [, $student, $session, $group] = $fixture;
        $session->update(['is_current' => false]);
        $other = Campus::create(['name' => 'Other', 'code' => 'OTHER']);
        AcademicSession::create(['campus_id' => $other->id, 'name' => 'Other 2026', 'start_date' => '2026-01-01', 'end_date' => '2026-12-31', 'is_current' => true]);
        $this->withoutMiddleware()->post(route('admin.studentfees.store'), ['student_ids' => [$student->id], 'fee_group_id' => $group->id, 'due_date' => '2026-09-01', 'billing_frequency' => 'one_time', 'discount_type' => 'none', 'discount_value' => 0, 'late_fee_type' => 'none', 'late_fee_value' => 0, 'grace_days' => 0])->assertSessionHasErrors('student_ids');
        $this->assertDatabaseCount('fee_assignments', 0);
    }

    public function test_class_filter_returns_all_sections_when_section_is_omitted(): void
    {
        [$campus, $student, $session] = $this->setupStudent();
        $class = SchoolClass::create(['campus_id' => $campus->id, 'name' => 'Class One']);
        $section = Section::create(['campus_id' => $campus->id, 'name' => 'A']);
        $class->sections()->attach($section->id);
        Enrollment::create(['student_id' => $student->id, 'academic_session_id' => $session->id, 'class_id' => $class->id, 'section_id' => $section->id, 'is_current' => true]);
        $response = app(StudentFeeController::class)->index(Request::create('/', 'GET', ['class_id' => $class->id]));
        $props = $response->toResponse(Request::create('/', 'GET', server: ['HTTP_X_INERTIA' => 'true']))->getData(true)['props'];
        $this->assertCount(1, $props['students']);
        $this->assertSame($student->id, $props['students'][0]['id']);
    }

    public function test_recurring_generation_catches_up_and_reopens_paid_assignment_without_duplicates(): void
    {
        $assignment = $this->assignment($this->setupStudent(), ['billing_frequency' => 'monthly', 'starts_on' => '2026-01-31', 'next_invoice_date' => '2026-01-31']);
        $automation = app(FeeAutomationService::class);
        $automation->generate(Carbon::parse('2026-01-31'));
        app(FeePaymentService::class)->receive($assignment, $assignment->student_id, 1000, ['payment_date' => '2026-01-31', 'payment_method' => 'Cash']);
        $this->assertSame('paid', $assignment->fresh()->status);
        $this->assertSame(2, $automation->generate(Carbon::parse('2026-03-31'))['created']);
        $this->assertSame(['2026-01-31', '2026-02-28', '2026-03-31'], Invoice::orderBy('period_start')->get()->map(fn ($i) => $i->period_start->toDateString())->all());
        $this->assertSame('partially_paid', $assignment->fresh()->status);
        $this->assertSame('2026-04-30', $assignment->fresh()->next_invoice_date->toDateString());
        $this->assertSame(0, $automation->generate(Carbon::parse('2026-03-31'))['created']);
        $this->assertDatabaseCount('invoices', 3);
    }

    public function test_fully_paid_assignment_cannot_create_a_new_legacy_charge(): void
    {
        $assignment = $this->assignment($this->setupStudent());
        $this->invoice($assignment);
        $service = app(FeePaymentService::class);
        $details = ['payment_date' => '2026-09-01', 'payment_method' => 'Cash'];
        $service->receive($assignment, $assignment->student_id, 1000, $details);
        try {
            $service->receive($assignment, $assignment->student_id, 10, $details);
            $this->fail('A settled assignment accepted another payment.');
        } catch (ValidationException $exception) {
            $this->assertArrayHasKey('amount_paid', $exception->errors());
        }
        $this->assertDatabaseCount('invoices', 1);
        $this->assertDatabaseCount('payments', 1);
    }

    public function test_online_payment_allocation_is_idempotent(): void
    {
        $assignment = $this->assignment($this->setupStudent());
        $invoice = $this->invoice($assignment);
        $transaction = PaymentTransaction::create(['campus_id' => $invoice->campus_id, 'student_id' => $invoice->student_id, 'transaction_id' => 'SSL-TEST', 'amount' => 200, 'currency' => 'BDT', 'status' => 'Pending', 'transaction_date' => '2026-09-01', 'source_type' => Invoice::class, 'source_id' => $invoice->id]);
        $service = app(FeePaymentService::class);
        $service->applyOnlinePayment($transaction);
        $service->applyOnlinePayment($transaction);
        $this->assertEquals(200, $invoice->fresh()->paid_amount);
        $this->assertDatabaseCount('payment_allocations', 1);
    }

    public function test_online_initiation_binds_invoice_and_rejects_cancelled_invoice_before_provider_call(): void
    {
        $fixture = $this->setupStudent();
        [$campus, $student] = $fixture;
        $user = User::factory()->create(['campus_id' => $campus->id]);
        $student->update(['user_id' => $user->id]);
        $invoice = $this->invoice($this->assignment($fixture), ['status' => 'Cancelled']);
        $this->mock(SslCommerzService::class)->shouldNotReceive('createSession');
        $this->actingAs($user)->withoutMiddleware([
            \App\Http\Middleware\EnforceTenantSubscription::class,
        ]);
        $request = Request::create('/', 'POST', ['amount' => 200]);
        $request->setUserResolver(fn () => $user);
        try {
            app(\App\Http\Controllers\SslCommerzPaymentController::class)->initiate($request, $invoice, app(SslCommerzService::class));
            $this->fail('Cancelled invoice accepted payment initiation.');
        } catch (\Symfony\Component\HttpKernel\Exception\HttpException $exception) {
            $this->assertSame(422, $exception->getStatusCode());
        }
        $this->assertDatabaseCount('payment_transactions', 0);
    }

    public function test_invoice_cannot_be_created_in_another_campus_or_with_excess_discount(): void
    {
        [$campus, $student, , $group] = $this->setupStudent();
        $other = Campus::create(['name' => 'Other', 'code' => 'OTHER']);
        $data = ['campus_id' => $other->id, 'student_id' => $student->id, 'fee_group_id' => $group->id, 'invoice_no' => 'MANUAL-1', 'invoice_date' => '2026-09-01', 'due_date' => '2026-09-30', 'amount' => 100, 'discount' => 0, 'status' => 'Unpaid'];
        $this->withoutMiddleware()->post(route('admin.fees.invoices.store'), $data)->assertSessionHasErrors('campus_id');
        $this->post(route('admin.fees.invoices.store'), array_merge($data, ['campus_id' => $campus->id, 'discount' => 200]))->assertSessionHasErrors('discount');
        $this->post(route('admin.fees.invoices.store'), array_merge($data, ['campus_id' => $campus->id]))->assertSessionHasNoErrors();
        $this->assertDatabaseCount('invoices', 1);
    }
}
