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
        Schema::create('staff_appraisals', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('staff_id'); 
            $table->date('appraisal_date');
            $table->string('period'); 
            $table->decimal('rating', 3, 1); 
            $table->text('remarks')->nullable(); 
            $table->unsignedBigInteger('evaluated_by'); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff_appraisals');
    }
};
