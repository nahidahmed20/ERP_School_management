<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('hostel_beds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hostel_room_id')->constrained()->cascadeOnDelete();
            $table->string('bed_number');
            $table->string('status')->default('available');
            $table->timestamps();
            $table->unique(['hostel_room_id', 'bed_number']);
        });

        Schema::table('hostel_allocations', function (Blueprint $table) {
            $table->foreignId('hostel_bed_id')->nullable()->after('hostel_room_id')->constrained()->nullOnDelete();
            $table->dateTime('checked_in_at')->nullable();
            $table->dateTime('checked_out_at')->nullable();
            $table->text('checkout_notes')->nullable();
        });

        Schema::create('hostel_room_changes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hostel_allocation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('from_room_id')->nullable()->constrained('hostel_rooms')->nullOnDelete();
            $table->foreignId('from_bed_id')->nullable()->constrained('hostel_beds')->nullOnDelete();
            $table->foreignId('to_room_id')->constrained('hostel_rooms')->cascadeOnDelete();
            $table->foreignId('to_bed_id')->constrained('hostel_beds')->cascadeOnDelete();
            $table->dateTime('changed_at');
            $table->text('reason')->nullable();
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('hostel_attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hostel_allocation_id')->constrained()->cascadeOnDelete();
            $table->date('attendance_date');
            $table->string('status');
            $table->time('check_time')->nullable();
            $table->text('remarks')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['hostel_allocation_id', 'attendance_date']);
        });

        Schema::create('hostel_visitors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hostel_allocation_id')->constrained()->cascadeOnDelete();
            $table->string('visitor_name');
            $table->string('phone')->nullable();
            $table->string('relation')->nullable();
            $table->string('id_number')->nullable();
            $table->dateTime('check_in_at');
            $table->dateTime('check_out_at')->nullable();
            $table->text('purpose')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('hostel_meal_allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hostel_allocation_id')->constrained()->cascadeOnDelete();
            $table->date('meal_date');
            $table->boolean('breakfast')->default(false);
            $table->boolean('lunch')->default(false);
            $table->boolean('dinner')->default(false);
            $table->decimal('amount', 10, 2)->default(0);
            $table->string('status')->default('allocated');
            $table->timestamps();
            $table->unique(['hostel_allocation_id', 'meal_date']);
        });

        Schema::create('hostel_ledger_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hostel_allocation_id')->constrained()->cascadeOnDelete();
            $table->string('type');
            $table->decimal('amount', 12, 2);
            $table->string('status')->default('due');
            $table->string('reference')->nullable();
            $table->text('notes')->nullable();
            $table->dateTime('occurred_at');
            $table->dateTime('paid_at')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('hostel_clearances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hostel_allocation_id')->constrained()->cascadeOnDelete();
            $table->string('status')->default('pending');
            $table->boolean('room_cleared')->default(false);
            $table->boolean('fees_cleared')->default(false);
            $table->boolean('assets_returned')->default(false);
            $table->decimal('total_due', 12, 2)->default(0);
            $table->decimal('deposit_adjusted', 12, 2)->default(0);
            $table->decimal('final_payable', 12, 2)->default(0);
            $table->dateTime('settled_at')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique('hostel_allocation_id');
        });
    }

    public function down(): void
    {
        foreach (['hostel_clearances','hostel_ledger_entries','hostel_meal_allocations','hostel_visitors','hostel_attendances','hostel_room_changes'] as $table) {
            Schema::dropIfExists($table);
        }
        Schema::table('hostel_allocations', function (Blueprint $table) {
            $table->dropConstrainedForeignId('hostel_bed_id');
            $table->dropColumn(['checked_in_at','checked_out_at','checkout_notes']);
        });
        Schema::dropIfExists('hostel_beds');
    }
};
