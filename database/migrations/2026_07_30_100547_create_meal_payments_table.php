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
        Schema::create('meal_payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('campus_id')->nullable();
            $table->unsignedBigInteger('user_id'); 
            $table->decimal('amount', 10, 2);
            $table->string('payment_method')->default('Cash');
            $table->string('transaction_id')->nullable();
            $table->date('payment_date');
            $table->string('remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meal_payments');
    }
};
