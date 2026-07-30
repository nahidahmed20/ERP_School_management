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
        Schema::create('id_card_templates', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('campus_id');
            $table->string('title');
            $table->string('layout_type')->default('Portrait');
            $table->string('theme_color')->default('#1e293b');
            $table->string('logo_image')->nullable();
            $table->string('signature_image')->nullable();
            $table->string('background_image')->nullable();
            $table->boolean('show_blood_group')->default(true);
            $table->boolean('show_address')->default(false);
            $table->boolean('show_phone')->default(true);
            $table->text('back_side_content')->nullable();
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
        Schema::dropIfExists('id_card_templates');
    }
};
