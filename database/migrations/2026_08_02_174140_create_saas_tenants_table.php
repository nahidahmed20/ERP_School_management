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
        Schema::create('saas_tenants', function (Blueprint $table) {
            $table->id();
            $table->string('company_name');
            $table->string('domain')->unique();
            $table->string('admin_email');
            $table->string('admin_phone')->nullable();
            $table->string('subscription_plan')->default('Trial');
            $table->string('status')->default('Active');
            $table->date('valid_until')->nullable(); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saas_tenants');
    }
};
