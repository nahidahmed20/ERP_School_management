<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            if (! Schema::hasColumn('purchase_orders', 'created_by')) $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            if (! Schema::hasColumn('purchase_orders', 'received_by')) $table->foreignId('received_by')->nullable()->constrained('users')->nullOnDelete();
            if (! Schema::hasColumn('purchase_orders', 'received_at')) $table->timestamp('received_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            if (Schema::hasColumn('purchase_orders', 'created_by')) $table->dropConstrainedForeignId('created_by');
            if (Schema::hasColumn('purchase_orders', 'received_by')) $table->dropConstrainedForeignId('received_by');
            if (Schema::hasColumn('purchase_orders', 'received_at')) $table->dropColumn('received_at');
        });
    }
};
