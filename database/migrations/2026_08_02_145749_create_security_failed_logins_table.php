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
        Schema::create('security_failed_logins', function (Blueprint $table) {
            $table->id();
            $table->string('email_attempted'); 
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable(); 
            $table->timestamp('attempted_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('security_failed_logins');
    }
};
