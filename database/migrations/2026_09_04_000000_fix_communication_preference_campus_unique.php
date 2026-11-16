<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            $this->dropMysqlIndexIfExists('communication_preference_unique');
            if ($this->mysqlForeignKeyExists('communication_preferences_campus_id_foreign')) {
                DB::statement('ALTER TABLE communication_preferences DROP FOREIGN KEY communication_preferences_campus_id_foreign');
            }
            if (! $this->mysqlIndexExists('communication_preference_campus_unique')) {
                DB::statement('CREATE UNIQUE INDEX communication_preference_campus_unique ON communication_preferences (campus_id, recipient_type, recipient_id, channel, category)');
            }
            return;
        }

        Schema::table('communication_preferences', function (Blueprint $table) {
            $table->dropUnique('communication_preference_unique');
            $table->unique(['campus_id', 'recipient_type', 'recipient_id', 'channel', 'category'], 'communication_preference_campus_unique');
        });
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            $this->dropMysqlIndexIfExists('communication_preference_campus_unique');
            DB::statement('CREATE UNIQUE INDEX communication_preference_unique ON communication_preferences (recipient_type, recipient_id, channel, category)');
            return;
        }

        Schema::table('communication_preferences', function (Blueprint $table) {
            $table->dropUnique('communication_preference_campus_unique');
            $table->unique(['recipient_type', 'recipient_id', 'channel', 'category'], 'communication_preference_unique');
        });
    }

    private function dropMysqlIndexIfExists(string $name): void
    {
        if ($this->mysqlIndexExists($name)) DB::statement("DROP INDEX {$name} ON communication_preferences");
    }

    private function mysqlIndexExists(string $name): bool
    {
        return DB::table('information_schema.statistics')
            ->where('table_schema', DB::getDatabaseName())
            ->where('table_name', 'communication_preferences')
            ->where('index_name', $name)
            ->exists();
    }

    private function mysqlForeignKeyExists(string $name): bool
    {
        return DB::table('information_schema.table_constraints')
            ->where('constraint_schema', DB::getDatabaseName())
            ->where('table_name', 'communication_preferences')
            ->where('constraint_name', $name)
            ->where('constraint_type', 'FOREIGN KEY')
            ->exists();
    }
};
