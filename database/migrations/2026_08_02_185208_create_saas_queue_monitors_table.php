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
        Schema::create('saas_queue_monitors', function (Blueprint $table) {
            $table->id();
            $table->string('job_name');
            $table->string('queue_name')->default('default');
            $table->string('status')->default('Pending');
            $table->json('payload')->nullable();
            $table->text('error_message')->nullable(); 
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saas_queue_monitors');
    }
};
