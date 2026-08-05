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
        Schema::create('transport_routes', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('start_point')->nullable();
            $table->string('end_point')->nullable();
            $table->decimal('base_fare', 10, 2)->default(0.00);
            $table->json('stops')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transport_routes');
    }
};
