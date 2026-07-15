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
        Schema::create('staff_payrolls', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('staff_id');
            $table->string('month'); 
            $table->integer('year'); 
            $table->decimal('basic_salary', 10, 2);
            $table->decimal('allowances', 10, 2)->default(0); 
            $table->decimal('deductions', 10, 2)->default(0); 
            $table->decimal('net_salary', 10, 2); 
            $table->enum('status', ['generated', 'paid'])->default('generated');
            $table->date('payment_date')->nullable();
            $table->string('payment_method')->nullable(); 
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff_payrolls');
    }
};
