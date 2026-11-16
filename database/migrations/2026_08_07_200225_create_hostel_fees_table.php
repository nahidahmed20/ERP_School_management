<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('hostel_fees', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('student_id'); // Who is paying
            $table->unsignedBigInteger('hostel_room_id')->nullable(); // Which room
            $table->decimal('amount', 10, 2); // Fee amount
            $table->string('month'); // e.g., 'January'
            $table->integer('year'); // e.g., 2026
            $table->date('payment_date')->nullable();
            $table->string('status')->default('Pending'); // Pending, Paid
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hostel_fees');
    }
};
