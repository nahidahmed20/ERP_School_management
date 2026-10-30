<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // 1. phone_call_logs
        if (Schema::hasTable('phone_call_logs') && !Schema::hasColumn('phone_call_logs', 'campus_id')) {
            Schema::table('phone_call_logs', function (Blueprint $table) {
                $table->unsignedBigInteger('campus_id')->nullable()->after('id');
                $table->foreign('campus_id')->references('id')->on('campuses')->onDelete('set null');
            });
        }

        // 2. postal_records
        if (Schema::hasTable('postal_records') && !Schema::hasColumn('postal_records', 'campus_id')) {
            Schema::table('postal_records', function (Blueprint $table) {
                $table->unsignedBigInteger('campus_id')->nullable()->after('id');
                $table->foreign('campus_id')->references('id')->on('campuses')->onDelete('set null');
            });
        }

        // 3. notices
        if (Schema::hasTable('notices') && !Schema::hasColumn('notices', 'campus_id')) {
            Schema::table('notices', function (Blueprint $table) {
                $table->unsignedBigInteger('campus_id')->nullable()->after('id');
                $table->foreign('campus_id')->references('id')->on('campuses')->onDelete('set null');
            });
        }

        // 4. class_section
        if (Schema::hasTable('class_section') && !Schema::hasColumn('class_section', 'campus_id')) {
            Schema::table('class_section', function (Blueprint $table) {
                $table->unsignedBigInteger('campus_id')->nullable()->after('id');
                $table->foreign('campus_id')->references('id')->on('campuses')->onDelete('set null');
            });
        }

        // 5. class_subject
        if (Schema::hasTable('class_subject') && !Schema::hasColumn('class_subject', 'campus_id')) {
            Schema::table('class_subject', function (Blueprint $table) {
                $table->unsignedBigInteger('campus_id')->nullable()->after('id');
                $table->foreign('campus_id')->references('id')->on('campuses')->onDelete('set null');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('phone_call_logs') && Schema::hasColumn('phone_call_logs', 'campus_id')) {
            Schema::table('phone_call_logs', function (Blueprint $table) {
                $table->dropForeign(['campus_id']);
                $table->dropColumn('campus_id');
            });
        }

        if (Schema::hasTable('postal_records') && Schema::hasColumn('postal_records', 'campus_id')) {
            Schema::table('postal_records', function (Blueprint $table) {
                $table->dropForeign(['campus_id']);
                $table->dropColumn('campus_id');
            });
        }

        if (Schema::hasTable('notices') && Schema::hasColumn('notices', 'campus_id')) {
            Schema::table('notices', function (Blueprint $table) {
                $table->dropForeign(['campus_id']);
                $table->dropColumn('campus_id');
            });
        }

        if (Schema::hasTable('class_section') && Schema::hasColumn('class_section', 'campus_id')) {
            Schema::table('class_section', function (Blueprint $table) {
                $table->dropForeign(['campus_id']);
                $table->dropColumn('campus_id');
            });
        }

        if (Schema::hasTable('class_subject') && Schema::hasColumn('class_subject', 'campus_id')) {
            Schema::table('class_subject', function (Blueprint $table) {
                $table->dropForeign(['campus_id']);
                $table->dropColumn('campus_id');
            });
        }
    }
};

