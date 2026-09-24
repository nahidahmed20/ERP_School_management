<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            $table->unsignedBigInteger('campus_id')->nullable()->after('id')->index();
            $table->dropUnique('accounts_code_unique');
            $table->unique(['campus_id', 'code'], 'accounts_campus_code_unique');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->unsignedBigInteger('account_id')->nullable()->after('student_id')->index();
        });

        Schema::table('payment_transactions', function (Blueprint $table) {
            $table->unsignedBigInteger('account_id')->nullable()->after('student_id')->index();
        });

        // A former global chart is copied per existing campus. Journal entries
        // are then repointed to their own-campus account; no historic journal is
        // deleted or rewritten in amount/date/source terms.
        $campuses = DB::table('campuses')->orderBy('id')->pluck('id');
        if ($campuses->isEmpty()) return;

        $mainCampusId = DB::table('campuses')->where('is_main', true)->value('id') ?? $campuses->first();
        DB::table('journal_entries')->whereNull('campus_id')->update(['campus_id' => $mainCampusId]);
        $legacyAccounts = DB::table('accounts')->whereNull('campus_id')->orderBy('id')->get();

        foreach ($legacyAccounts as $legacy) {
            foreach ($campuses as $campusId) {
                $copyId = DB::table('accounts')->insertGetId([
                    'campus_id' => $campusId, 'name' => $legacy->name, 'code' => $legacy->code,
                    'type' => $legacy->type, 'opening_balance' => $legacy->opening_balance,
                    'description' => $legacy->description, 'is_active' => $legacy->is_active,
                    'created_at' => $legacy->created_at ?? now(), 'updated_at' => now(),
                ]);
                DB::table('journal_entries')->where('campus_id', $campusId)->where('debit_account_id', $legacy->id)->update(['debit_account_id' => $copyId]);
                DB::table('journal_entries')->where('campus_id', $campusId)->where('credit_account_id', $legacy->id)->update(['credit_account_id' => $copyId]);
            }
        }

        // Legacy global rows are no longer referenced after the remap. They are
        // retained only when a custom external table still references one.
        DB::table('accounts')->whereNull('campus_id')->whereNotExists(function ($query) {
            $query->selectRaw('1')->from('journal_entries')
                ->whereColumn('journal_entries.debit_account_id', 'accounts.id')
                ->orWhereColumn('journal_entries.credit_account_id', 'accounts.id');
        })->delete();
    }

    public function down(): void
    {
        Schema::table('payment_transactions', fn (Blueprint $table) => $table->dropIndex(['account_id']));
        Schema::table('payment_transactions', fn (Blueprint $table) => $table->dropColumn('account_id'));
        Schema::table('payments', fn (Blueprint $table) => $table->dropIndex(['account_id']));
        Schema::table('payments', fn (Blueprint $table) => $table->dropColumn('account_id'));
        Schema::table('accounts', function (Blueprint $table) {
            $table->dropUnique('accounts_campus_code_unique');
            $table->unique('code');
            $table->dropIndex(['campus_id']);
            $table->dropColumn('campus_id');
        });
    }
};
