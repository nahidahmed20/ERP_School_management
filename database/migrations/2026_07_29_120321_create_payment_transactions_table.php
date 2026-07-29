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
        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('payment_gateway_id')->nullable();
            $table->string('transaction_id')->unique(); 
            $table->string('reference_no')->nullable(); 
            $table->decimal('amount', 10, 2); 
            $table->string('currency')->default('BDT'); 
            $table->string('payment_method')->nullable(); 
            $table->enum('status', ['Pending', 'Completed', 'Failed', 'Refunded'])->default('Pending'); 
            $table->date('transaction_date'); 
            $table->text('note')->nullable(); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_transactions');
    }
};
