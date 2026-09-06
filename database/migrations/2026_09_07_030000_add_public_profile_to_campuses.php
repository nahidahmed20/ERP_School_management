<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('campuses', function (Blueprint $table) {
            $table->text('public_description')->nullable()->after('address');
            $table->json('facilities')->nullable()->after('public_description');
            $table->string('map_url')->nullable()->after('facilities');
        });
    }

    public function down(): void
    {
        Schema::table('campuses', fn (Blueprint $table) => $table->dropColumn(['public_description', 'facilities', 'map_url']));
    }
};
