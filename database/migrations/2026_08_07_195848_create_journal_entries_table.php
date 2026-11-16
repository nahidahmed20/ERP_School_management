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
        Schema::create('journal_entries', function (Blueprint $table) {
            $table->id();
            $table->string('voucher_no')->unique(); // e.g., VCH-2026-0001
            $table->date('date');
            $table->string('voucher_type'); // Receipt, Payment, Contra, Journal
            $table->unsignedBigInteger('debit_account_id'); // Account receiving the value
            $table->unsignedBigInteger('credit_account_id'); // Account giving the value
            $table->decimal('amount', 12, 2);
            $table->text('description')->nullable();
            $table->unsignedBigInteger('created_by')->nullable(); // Who posted this
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('journal_entries');
    }
};
