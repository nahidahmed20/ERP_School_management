<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('student_development_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campus_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->string('record_type', 50)->index();
            $table->date('record_date')->index();
            $table->date('follow_up_date')->nullable();
            $table->string('title');
            $table->string('period')->nullable();
            $table->decimal('amount', 12, 2)->default(0);
            $table->decimal('score', 5, 2)->nullable();
            $table->string('status', 30)->default('open');
            $table->json('details')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['student_id','record_type','record_date','title'], 'student_development_unique');
        });
    }
    public function down(): void { Schema::dropIfExists('student_development_records'); }
};
