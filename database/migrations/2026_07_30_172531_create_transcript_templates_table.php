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
        Schema::create('transcript_templates', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('campus_id');
            $table->string('title');
            $table->string('grading_system')->default('GPA 5.0');
            $table->text('header_text')->nullable();
            $table->text('footer_text')->nullable();
            $table->string('watermark_image')->nullable();
            $table->string('authorized_signature_title')->default('Controller of Examinations');
            $table->string('authorized_signature_image')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transcript_templates');
    }
};
