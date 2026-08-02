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
        Schema::create('saas_api_keys', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('api_key')->unique();
            $table->unsignedBigInteger('tenant_id')->nullable(); 
            $table->timestamp('last_used_at')->nullable();
            $table->date('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saas_api_keys');
    }
};
