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
        Schema::create('saas_ai_assistants', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('provider')->default('OpenAI');
            $table->string('model_name')->default('gpt-4');
            $table->text('system_prompt')->nullable(); 
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saas_ai_assistants');
    }
};
