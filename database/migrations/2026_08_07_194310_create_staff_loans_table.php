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
        Schema::create('staff_loans', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('staff_id');
            $table->string('loan_type');
            $table->decimal('amount', 10, 2);
            $table->decimal('monthly_deduction', 10, 2)->nullable();
            $table->text('reason')->nullable();
            $table->string('status')->default('Pending');
            $table->unsignedBigInteger('approved_by')->nullable(); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff_loans');
    }
};
