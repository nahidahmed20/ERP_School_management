<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\{DB, Schema};

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('cafeteria_raw_materials')) {
            Schema::create('cafeteria_raw_materials', function (Blueprint $table) {
                $table->id();
                $table->foreignId('campus_id')->constrained()->cascadeOnDelete();
                $table->string('name');
                $table->decimal('stock_quantity', 10, 2)->default(0);
                $table->decimal('reorder_level', 10, 2)->default(5);
                $table->string('stock_unit', 50)->default('kg');
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (Schema::hasTable('food_items') && Schema::hasColumn('food_items', 'cafeteria_raw_material_id')) {
            $foreignKeyExists = DB::selectOne(
                'SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? AND REFERENCED_TABLE_NAME = ? LIMIT 1',
                ['food_items', 'cafeteria_raw_material_id', 'cafeteria_raw_materials']
            );

            if (! $foreignKeyExists) {
                Schema::table('food_items', function (Blueprint $table) {
                    $table->foreign('cafeteria_raw_material_id', 'food_items_raw_material_fk')
                        ->references('id')->on('cafeteria_raw_materials')->nullOnDelete();
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cafeteria_raw_materials');
    }
};
