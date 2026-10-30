<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration to add the campus_id foreign key to the visitor_logs table.
 *
 * The VisitorLog model uses the BelongsToCampus trait which expects a
 * `campus_id` column. Previously this column was missing, causing a runtime
 * error. This migration adds the column as nullable (so existing rows are
 * unaffected) and defines a foreign key to the `campuses` table.
 */
return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('visitor_logs', function (Blueprint $table) {
            // Add the column after the `visit_date` column for readability.
            $table->unsignedBigInteger('campus_id')
                  ->nullable()
                  ->after('visit_date');

            // Define the foreign key relationship.
            $table->foreign('campus_id')
                  ->references('id')
                  ->on('campuses')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('visitor_logs', function (Blueprint $table) {
            $table->dropForeign(['campus_id']);
            $table->dropColumn('campus_id');
        });
    }
};

