<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private array $tables = ['transport_vehicle_personnel','transport_stops','vehicle_fuel_logs','vehicle_maintenance_logs','transport_personnel_documents','student_boarding_attendances','vehicle_locations','transport_geofence_events','transport_fee_charges','vehicle_expenses','hostel_beds','hostel_room_changes','hostel_attendances','hostel_visitors','hostel_meal_allocations','hostel_ledger_entries','hostel_clearances'];

    public function up(): void
    {
        foreach ($this->tables as $table) if (Schema::hasTable($table) && !Schema::hasColumn($table, 'campus_id')) Schema::table($table, fn (Blueprint $blueprint) => $blueprint->foreignId('campus_id')->nullable()->after('id')->constrained()->nullOnDelete());
        $parents = [
            'transport_vehicle_personnel'=>['vehicles','vehicle_id'], 'transport_stops'=>['transport_routes','transport_route_id'], 'vehicle_fuel_logs'=>['vehicles','vehicle_id'], 'vehicle_maintenance_logs'=>['vehicles','vehicle_id'],
            'transport_personnel_documents'=>['transport_personnel','transport_personnel_id'], 'student_boarding_attendances'=>['transport_allocations','transport_allocation_id'], 'vehicle_locations'=>['vehicles','vehicle_id'],
            'transport_geofence_events'=>['vehicles','vehicle_id'], 'transport_fee_charges'=>['transport_allocations','transport_allocation_id'], 'vehicle_expenses'=>['vehicles','vehicle_id'], 'hostel_beds'=>['hostel_rooms','hostel_room_id'],
            'hostel_room_changes'=>['hostel_allocations','hostel_allocation_id'], 'hostel_attendances'=>['hostel_allocations','hostel_allocation_id'], 'hostel_visitors'=>['hostel_allocations','hostel_allocation_id'],
            'hostel_meal_allocations'=>['hostel_allocations','hostel_allocation_id'], 'hostel_ledger_entries'=>['hostel_allocations','hostel_allocation_id'], 'hostel_clearances'=>['hostel_allocations','hostel_allocation_id'],
        ];
        foreach ($parents as $table => [$parent, $foreign]) DB::table($table)->whereNull('campus_id')->orderBy('id')->eachById(function ($row) use ($table, $parent, $foreign) { DB::table($table)->where('id', $row->id)->update(['campus_id'=>DB::table($parent)->where('id', $row->{$foreign})->value('campus_id')]); });
    }

    public function down(): void
    {
        foreach (array_reverse($this->tables) as $table) if (Schema::hasTable($table) && Schema::hasColumn($table, 'campus_id')) Schema::table($table, fn (Blueprint $blueprint) => $blueprint->dropConstrainedForeignId('campus_id'));
    }
};
