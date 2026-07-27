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
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('campus_id')->nullable();
            $table->string('vehicle_number'); // e.g., Dhaka-Metro-B-11-2233
            $table->string('vehicle_model')->nullable(); // e.g., Tata Starbus
            $table->string('driver_name');
            $table->string('driver_phone');
            $table->string('route_name'); // e.g., Route A (Mirpur to Campus)
            $table->integer('capacity')->default(40);
            $table->text('note')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
