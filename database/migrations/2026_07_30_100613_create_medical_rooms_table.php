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
        Schema::create('medical_rooms', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('campus_id')->nullable();
            $table->string('room_number');
            $table->string('nurse_name');
            $table->string('phone')->nullable();
            $table->integer('total_beds')->default(1);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medical_rooms');
    }
};
