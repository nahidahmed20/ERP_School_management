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
        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_group_id')->constrained()->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()
                  ->constrained('menu_items')->cascadeOnDelete();
            $table->string('key')->unique();      
            $table->string('label');
            $table->string('icon')->nullable();
            $table->string('route_name')->nullable();
            $table->unsignedInteger('badge_count')->nullable();
            $table->string('permission')->nullable();
            $table->unsignedInteger('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_items');
    }
};
