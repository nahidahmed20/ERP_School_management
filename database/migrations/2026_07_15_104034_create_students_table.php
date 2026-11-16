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
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('campus_id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('guardian_id');
            $table->string('admission_no')->unique();
            $table->date('admission_date');
            $table->string('first_name');
            $table->string('last_name')->nullable();
            $table->enum('gender', ['male', 'female', 'other']);
            $table->date('date_of_birth');
            $table->string('birth_certificate_no')->nullable()->unique(); 
            $table->string('national_id')->nullable()->unique(); 
            $table->string('mother_tongue')->nullable(); 
            $table->text('previous_school_details')->nullable(); 
            $table->string('medical_history')->nullable(); 
            $table->string('blood_group')->nullable();
            $table->string('religion')->nullable();
            $table->string('nationality')->default('Bangladeshi');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('photo')->nullable();
            $table->text('present_address');
            $table->text('permanent_address');
            $table->unsignedBigInteger('house_id')->nullable(); 
            $table->unsignedBigInteger('category_id')->nullable(); 
            $table->boolean('status')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
