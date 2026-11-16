<?php

namespace Tests\Feature;

use App\Models\Campus;
use App\Models\HostelRoom;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class OperationalCampusBoundaryTest extends TestCase
{
    use RefreshDatabase;

    public function test_transport_operations_reject_a_vehicle_from_another_campus(): void
    {
        [$user, $otherCampus] = $this->operatorFor('admin.transport.fuel');
        config(['app.active_campus_id' => $otherCampus->id]);
        $vehicle = Vehicle::create([
            'vehicle_number' => 'REMOTE-01',
            'driver_name' => 'Remote Driver',
            'driver_phone' => '01700000000',
            'route_name' => 'Remote Route',
        ]);

        $this->actingAs($user)->post(route('admin.transport.fuel'), [
            'vehicle_id' => $vehicle->id,
            'date' => now()->toDateString(),
            'litres' => 10,
            'unit_price' => 120,
        ])->assertSessionHasErrors('vehicle_id');

        $this->assertSame(0, DB::table('vehicle_fuel_logs')->count());
    }

    public function test_hostel_operations_reject_a_room_from_another_campus(): void
    {
        [$user, $otherCampus] = $this->operatorFor('admin.hostel.beds');
        config(['app.active_campus_id' => $otherCampus->id]);
        $room = HostelRoom::create([
            'hostel_name' => 'Remote Hostel',
            'room_number' => 'R-1',
            'room_type' => 'Standard',
            'bed_capacity' => 2,
            'cost_per_bed' => 1000,
        ]);

        $this->actingAs($user)->post(route('admin.hostel.beds'), [
            'hostel_room_id' => $room->id,
            'bed_number' => 'B-1',
        ])->assertSessionHasErrors('hostel_room_id');

        $this->assertSame(0, DB::table('hostel_beds')->count());
    }

    public function test_admin_cannot_forge_campus_ownership_in_a_write_request(): void
    {
        [$user, $otherCampus] = $this->operatorFor('admin.purchase.vendors.store');

        $this->actingAs($user)->post(route('admin.purchase.vendors.store'), [
            'campus_id' => $otherCampus->id,
            'name' => 'Scoped Vendor',
            'phone' => '01700000001',
            'is_active' => true,
        ])->assertSessionHasNoErrors();

        $vendor = Vendor::withoutGlobalScope('campus')->where('name', 'Scoped Vendor')->firstOrFail();
        $this->assertSame($user->campus_id, $vendor->campus_id);
        $this->assertNotSame($otherCampus->id, $vendor->campus_id);
    }

    private function operatorFor(string $permissionName): array
    {
        $campus = Campus::create(['name' => 'Campus A', 'code' => 'A']);
        $otherCampus = Campus::create(['name' => 'Campus B', 'code' => 'B']);
        $user = User::factory()->create(['campus_id' => $campus->id]);
        $permission = Permission::create(['name' => $permissionName, 'guard_name' => 'web']);
        $user->givePermissionTo($permission);

        return [$user, $otherCampus];
    }
}
