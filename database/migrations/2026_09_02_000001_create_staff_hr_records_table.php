<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('staff_hr_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campus_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('staff_id')->constrained('staff')->cascadeOnDelete();
            $table->string('record_type', 40)->index();
            $table->date('record_date')->index();
            $table->string('title');
            $table->string('period')->nullable();
            $table->decimal('employee_amount', 12, 2)->default(0);
            $table->decimal('employer_amount', 12, 2)->default(0);
            $table->decimal('rating', 5, 2)->nullable();
            $table->string('status', 30)->default('draft');
            $table->json('details')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['staff_id', 'record_type', 'record_date', 'title'], 'staff_hr_record_unique');
        });
    }

    public function down(): void { Schema::dropIfExists('staff_hr_records'); }
};
