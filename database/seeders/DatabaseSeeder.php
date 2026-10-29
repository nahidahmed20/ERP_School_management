<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            MenuSeeder::class,
            StaffSeeder::class,
            OfficialDocumentSeeder::class,
            MenuOrderSeeder::class,
            QuestionPaperMenuSeeder::class,
            StaffHrMenuSeeder::class,
            StudentDevelopmentMenuSeeder::class,
            StudentPortalMenuSeeder::class,
            StudentPortalPermissionSeeder::class,
        ]);
    }
}
