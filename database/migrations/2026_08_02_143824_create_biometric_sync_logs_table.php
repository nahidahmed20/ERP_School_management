<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('biometric_sync_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('campus_id')->nullable();
            $table->unsignedBigInteger('device_id')->nullable(); 
            $table->unsignedBigInteger('enrolled_user_id')->nullable();
            $table->string('biometric_id'); 
            $table->timestamp('punch_time'); 
            $table->string('punch_state')->default('Check-In'); 
            $table->string('sync_status')->default('Success'); 
            $table->text('error_message')->nullable();
            $table->json('raw_data')->nullable(); 
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('biometric_sync_logs');
    }
};