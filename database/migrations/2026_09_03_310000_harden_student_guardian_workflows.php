<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('guardians', function (Blueprint $table) {
            $table->foreignId('campus_id')->nullable()->after('id')->constrained()->nullOnDelete();
        });

        Schema::table('student_authorized_pickups', function (Blueprint $table) {
            $table->foreignId('campus_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
        });

        Schema::table('student_guardian_notes', function (Blueprint $table) {
            $table->foreignId('campus_id')->nullable()->after('id')->constrained()->nullOnDelete();
        });

        Schema::table('parent_consents', function (Blueprint $table) {
            $table->foreignId('campus_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $table->boolean('is_granted')->nullable()->change();
            $table->timestamp('responded_at')->nullable()->change();
            $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
        });

        Schema::table('student_clearances', function (Blueprint $table) {
            $table->foreignId('campus_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $table->foreignId('student_transfer_id')->nullable()->after('student_id')->constrained('student_transfers')->cascadeOnDelete();
        });

        DB::table('guardians')->orderBy('id')->eachById(function ($guardian) {
            $campusId = DB::table('students')->where('guardian_id', $guardian->id)->value('campus_id')
                ?? DB::table('student_guardians')->join('students', 'students.id', '=', 'student_guardians.student_id')->where('student_guardians.guardian_id', $guardian->id)->value('students.campus_id');
            DB::table('guardians')->where('id', $guardian->id)->update(['campus_id' => $campusId]);
        });

        foreach (['student_authorized_pickups', 'student_guardian_notes', 'parent_consents', 'student_clearances'] as $table) {
            DB::table($table)->orderBy('id')->eachById(function ($row) use ($table) {
                DB::table($table)->where('id', $row->id)->update(['campus_id' => DB::table('students')->where('id', $row->student_id)->value('campus_id')]);
            });
        }
    }

    public function down(): void
    {
        Schema::table('student_clearances', function (Blueprint $table) {
            $table->dropConstrainedForeignId('student_transfer_id');
            $table->dropConstrainedForeignId('campus_id');
        });
        Schema::table('parent_consents', function (Blueprint $table) {
            $table->dropConstrainedForeignId('assigned_by');
            $table->dropConstrainedForeignId('campus_id');
            $table->boolean('is_granted')->nullable(false)->change();
            $table->timestamp('responded_at')->nullable(false)->change();
        });
        Schema::table('student_guardian_notes', fn (Blueprint $table) => $table->dropConstrainedForeignId('campus_id'));
        Schema::table('student_authorized_pickups', function (Blueprint $table) {
            $table->dropConstrainedForeignId('verified_by');
            $table->dropConstrainedForeignId('campus_id');
            $table->dropColumn('verified_at');
        });
        Schema::table('guardians', fn (Blueprint $table) => $table->dropConstrainedForeignId('campus_id'));
    }
};
