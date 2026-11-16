<?php

namespace Tests\Feature;

use App\Models\AcademicSession;
use App\Models\Asset;
use App\Models\AssetAssignment;
use App\Models\Book;
use App\Models\BookCopy;
use App\Models\Campus;
use App\Models\MealPayment;
use App\Models\MedicalRoom;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class CampusRecordBoundaryTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_working_campus_cannot_delete_records_owned_by_another_campus(): void
    {
        $campusA = Campus::create(['name' => 'Campus A', 'code' => 'A']);
        $campusB = Campus::create(['name' => 'Campus B', 'code' => 'B']);

        $foreignUser = User::factory()->create(['campus_id' => $campusB->id]);
        $session = AcademicSession::withoutGlobalScopes()->create([
            'campus_id' => $campusB->id,
            'name' => 'Campus B Session',
            'start_date' => '2026-01-01',
            'end_date' => '2026-12-31',
        ]);
        $payment = MealPayment::withoutGlobalScopes()->create([
            'campus_id' => $campusB->id,
            'user_id' => $foreignUser->id,
            'amount' => 250,
            'payment_method' => 'Cash',
            'payment_date' => '2026-01-10',
        ]);
        $room = MedicalRoom::withoutGlobalScopes()->create([
            'campus_id' => $campusB->id,
            'room_number' => 'B-101',
            'nurse_name' => 'Campus B Nurse',
            'total_beds' => 4,
        ]);
        $asset = Asset::withoutGlobalScopes()->create([
            'campus_id' => $campusB->id,
            'asset_tag' => 'ASSET-B-001',
            'name' => 'Campus B Projector',
        ]);
        $assignment = AssetAssignment::withoutGlobalScopes()->create([
            'asset_id' => $asset->id,
            'assignee_name' => 'Campus B Teacher',
            'assigned_date' => '2026-01-10',
            'status' => 'Assigned',
        ]);
        $book = Book::withoutGlobalScopes()->create([
            'title' => 'Campus B Book',
            'qty' => 1,
            'available' => 1,
        ]);
        BookCopy::withoutGlobalScopes()->create([
            'campus_id' => $campusB->id,
            'book_id' => $book->id,
            'accession_no' => 'ACC-B-001',
            'barcode' => 'BAR-B-001',
            'qr_code' => 'QR-B-001',
        ]);

        $administrator = User::factory()->create(['campus_id' => null]);
        $administrator->assignRole(Role::findOrCreate('Super Admin', 'web'));

        $this->actingAs($administrator)->withSession(['active_campus_id' => $campusA->id]);

        $this->delete(route('admin.sessions.destroy', $session))->assertNotFound();
        $this->delete(route('admin.cafeteria.meal-payments.destroy', $payment))->assertNotFound();
        $this->delete(route('admin.medical.rooms.destroy', $room))->assertNotFound();
        $this->delete(route('admin.purchase.asset-assignments.destroy', $assignment))->assertNotFound();
        $this->delete(route('admin.library.catalogue.destroy', $book))->assertNotFound();

        $this->assertDatabaseHas('academic_sessions', ['id' => $session->id]);
        $this->assertDatabaseHas('meal_payments', ['id' => $payment->id]);
        $this->assertDatabaseHas('medical_rooms', ['id' => $room->id]);
        $this->assertDatabaseHas('asset_assignments', ['id' => $assignment->id]);
        $this->assertDatabaseHas('books', ['id' => $book->id]);
    }
}
