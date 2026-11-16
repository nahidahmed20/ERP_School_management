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
            $table->string('salary_month');
            $table->decimal('basic_salary', 10, 2);
            $table->decimal('allowance', 10, 2)->default(0.00);
            $table->decimal('deduction', 10, 2)->default(0.00); 
            $table->decimal('net_salary', 10, 2);
            $table->string('payment_method')->nullable();
            $table->date('payment_date')->nullable();
            $table->enum('status', ['paid', 'unpaid', 'pending'])->default('unpaid');
            $table->text('note')->nullable();
            $table->timestamps();
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
