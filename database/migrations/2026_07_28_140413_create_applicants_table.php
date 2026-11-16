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
        Schema::create('applicants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_post_id')->constrained('job_posts')->cascadeOnDelete(); 
            $table->string('name'); 
            $table->string('email')->nullable(); 
            $table->string('phone'); 
            $table->string('resume')->nullable(); 
            $table->text('cover_letter')->nullable(); 
            $table->date('applied_date'); 
            $table->enum('status', ['Pending', 'Shortlisted', 'Interviewed', 'Hired', 'Rejected'])->default('Pending'); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applicants');
    }
};
