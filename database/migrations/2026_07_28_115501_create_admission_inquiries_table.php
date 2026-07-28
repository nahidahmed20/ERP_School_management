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
        Schema::create('admission_inquiries', function (Blueprint $table) {
            $table->id();
            $table->string('applicant_name'); 
            $table->string('guardian_name'); 
            $table->string('phone'); 
            $table->string('class_interested'); 
            $table->date('inquiry_date'); 
            $table->date('next_follow_up_date')->nullable(); 
            $table->enum('status', ['Pending', 'Follow-up', 'Converted', 'Cancelled'])->default('Pending');
            $table->text('notes')->nullable(); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admission_inquiries');
    }
};
