<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('migrations') && Schema::hasColumn('migrations', 'id')) {
            DB::statement('ALTER TABLE `migrations` MODIFY `id` INT UNSIGNED NOT NULL AUTO_INCREMENT');
        }

        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        $columns = DB::select(<<<'SQL'
            SELECT c.TABLE_NAME AS table_name, c.COLUMN_TYPE AS column_type
            FROM information_schema.COLUMNS c
            INNER JOIN (
                SELECT TABLE_SCHEMA, TABLE_NAME
                FROM information_schema.KEY_COLUMN_USAGE
                WHERE CONSTRAINT_NAME = 'PRIMARY'
                GROUP BY TABLE_SCHEMA, TABLE_NAME
                HAVING COUNT(*) = 1 AND MAX(COLUMN_NAME) = 'id'
            ) primary_key ON primary_key.TABLE_SCHEMA = c.TABLE_SCHEMA
                AND primary_key.TABLE_NAME = c.TABLE_NAME
            WHERE c.TABLE_SCHEMA = ?
              AND c.COLUMN_NAME = 'id'
              AND c.EXTRA NOT LIKE '%auto_increment%'
              AND c.DATA_TYPE IN ('tinyint', 'smallint', 'mediumint', 'int', 'bigint')
              AND NOT EXISTS (
                  SELECT 1
                  FROM information_schema.COLUMNS other_column
                  WHERE other_column.TABLE_SCHEMA = c.TABLE_SCHEMA
                    AND other_column.TABLE_NAME = c.TABLE_NAME
                    AND other_column.EXTRA LIKE '%auto_increment%'
              )
            ORDER BY c.TABLE_NAME
            SQL,
            [DB::getDatabaseName()]
        );

        foreach ($columns as $column) {
            $table = str_replace('`', '``', $column->table_name);
            $type = strtolower($column->column_type);

            // COLUMN_TYPE is database metadata; keep only integer definitions.
            if (! preg_match('/^(tinyint|smallint|mediumint|int|bigint)(?:\(\d+\))?(?: unsigned)?$/', $type)) {
                continue;
            }

            DB::statement("ALTER TABLE `{$table}` MODIFY `id` {$type} NOT NULL AUTO_INCREMENT");
        }
    }

    public function down(): void
    {
        // Keep primary keys auto-incrementing when rolling back.
    }
};
