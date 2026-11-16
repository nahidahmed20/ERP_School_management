<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fee_group_class_rates', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('fee_group_id');
            $table->unsignedBigInteger('school_class_id');
            $table->unsignedBigInteger('academic_session_id');
            $table->decimal('amount', 12, 2);
            $table->timestamps();
            $table->unique(['fee_group_id', 'school_class_id', 'academic_session_id'], 'fee_group_class_rates_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fee_group_class_rates');
    }
};
