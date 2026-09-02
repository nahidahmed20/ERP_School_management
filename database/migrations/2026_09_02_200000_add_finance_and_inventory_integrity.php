<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('purchase_items', function (Blueprint $table) {
            $table->unsignedInteger('reorder_level')->default(5)->after('quantity');
        });

        Schema::table('sale_items', function (Blueprint $table) {
            $table->decimal('unit_cost', 12, 2)->default(0)->after('unit_price');
        });

        Schema::table('journal_entries', function (Blueprint $table) {
            $table->unsignedBigInteger('campus_id')->nullable()->after('id');
            $table->string('source_type')->nullable()->after('created_by');
            $table->unsignedBigInteger('source_id')->nullable()->after('source_type');
            $table->string('source_key')->nullable()->unique()->after('source_id');
            $table->timestamp('reversed_at')->nullable()->after('source_key');
            $table->index(['source_type', 'source_id']);
        });

        Schema::table('payment_transactions', function (Blueprint $table) {
            $table->string('source_type')->nullable()->after('note');
            $table->unsignedBigInteger('source_id')->nullable()->after('source_type');
            $table->unsignedBigInteger('student_id')->nullable()->after('source_id');
            $table->index(['source_type', 'source_id']);
            $table->index('student_id');
        });

        Schema::create('inventory_movements', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('campus_id')->nullable();
            $table->unsignedBigInteger('purchase_item_id');
            $table->string('movement_type');
            $table->integer('quantity_change');
            $table->unsignedInteger('quantity_before');
            $table->unsignedInteger('quantity_after');
            $table->decimal('unit_cost', 12, 2)->default(0);
            $table->string('reference_type')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->text('note')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
            $table->index(['purchase_item_id', 'created_at']);
            $table->index(['reference_type', 'reference_id']);
        });

        $this->addMenu('fees', 'admin.reports.financial-summary', 'Financial Reports', 'admin.reports.financial-summary');
        $this->addMenu('purchase', 'admin.purchase.items.report', 'Stock & Movement Report', 'admin.purchase.items.report');
    }

    public function down(): void
    {
        DB::table('menu_items')->whereIn('key', ['admin.reports.financial-summary', 'admin.purchase.items.report'])->delete();
        Schema::dropIfExists('inventory_movements');
        Schema::table('payment_transactions', function (Blueprint $table) {
            $table->dropIndex(['source_type', 'source_id']);
            $table->dropIndex(['student_id']);
            $table->dropColumn(['source_type', 'source_id', 'student_id']);
        });
        Schema::table('journal_entries', function (Blueprint $table) {
            $table->dropIndex(['source_type', 'source_id']);
            $table->dropUnique(['source_key']);
            $table->dropColumn(['campus_id', 'source_type', 'source_id', 'source_key', 'reversed_at']);
        });
        Schema::table('sale_items', fn (Blueprint $table) => $table->dropColumn('unit_cost'));
        Schema::table('purchase_items', fn (Blueprint $table) => $table->dropColumn('reorder_level'));
    }

    private function addMenu(string $parentKey, string $key, string $label, string $route): void
    {
        $parent = DB::table('menu_items')->where('key', $parentKey)->first();
        if (! $parent || DB::table('menu_items')->where('key', $key)->exists()) return;

        DB::table('menu_items')->insert([
            'menu_group_id' => $parent->menu_group_id,
            'parent_id' => $parent->id,
            'key' => $key,
            'label' => $label,
            'route_name' => $route,
            'permission' => $route,
            'order' => DB::table('menu_items')->where('parent_id', $parent->id)->max('order') + 1,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
};
