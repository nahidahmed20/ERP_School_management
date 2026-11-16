<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('translation_entries', function (Blueprint $table) {
            $table->id();
            $table->string('source_key', 500)->unique();
            $table->text('english_text');
            $table->text('bangla_text');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('translation_entries');
    }
};
