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
        Schema::create('visit_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('campus_id')->nullable();
            $table->foreignId('medical_room_id')->constrained('medical_rooms')->cascadeOnDelete();
            $table->unsignedBigInteger('user_id'); 
            $table->dateTime('visit_time');
            $table->string('symptoms');
            $table->string('diagnosis')->nullable();
            $table->string('treatment_given')->nullable();
            $table->string('action_taken')->default('Rest in Room'); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visit_logs');
    }
};
