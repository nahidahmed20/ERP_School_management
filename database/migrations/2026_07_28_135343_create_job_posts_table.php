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
        Schema::create('job_posts', function (Blueprint $table) {
            $table->id();
            $table->string('title'); 
            $table->string('department')->nullable(); 
            $table->string('employment_type'); 
            $table->integer('vacancies')->default(1); 
            $table->date('deadline');
            $table->text('description')->nullable(); 
            $table->enum('status', ['Open', 'Closed'])->default('Open'); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_posts');
    }
};
