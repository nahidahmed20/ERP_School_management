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
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('campus_id')->nullable();
            $table->string('asset_tag')->unique();
            $table->string('name');
            $table->string('category')->nullable();
            $table->unsignedBigInteger('assigned_to')->nullable();
            $table->string('location')->nullable(); 
            $table->date('purchase_date')->nullable();
            $table->decimal('cost', 10, 2)->default(0.00);
            $table->enum('status', ['Available', 'Assigned', 'Maintenance', 'Damaged', 'Lost'])->default('Available');
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
