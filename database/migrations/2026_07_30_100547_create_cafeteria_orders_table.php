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
        Schema::create('cafeteria_orders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('campus_id')->nullable();
            $table->unsignedBigInteger('user_id');
            $table->foreignId('cafeteria_outlet_id')->constrained('cafeteria_outlets')->cascadeOnDelete();
            $table->string('order_number')->unique();
            $table->decimal('total_amount', 10, 2);
            $table->string('status')->default('Pending'); 
            $table->string('payment_status')->default('Unpaid'); 
            $table->json('items'); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cafeteria_orders');
    }
};
