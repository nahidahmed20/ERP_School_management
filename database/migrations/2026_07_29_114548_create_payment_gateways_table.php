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
        Schema::create('payment_gateways', function (Blueprint $table) {
            $table->id();
            $table->string('name'); 
            $table->string('slug')->unique(); 
            $table->string('api_key')->nullable(); 
            $table->string('api_secret')->nullable(); 
            $table->string('webhook_secret')->nullable(); 
            $table->string('currency')->default('BDT'); 
            $table->enum('mode', ['sandbox', 'live'])->default('sandbox'); 
            $table->boolean('is_active')->default(false); 
            $table->string('logo')->nullable(); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_gateways');
    }
};
