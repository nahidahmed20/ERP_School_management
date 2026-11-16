<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class InvalidateDefaultSeededCredentialsTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_published_seed_credentials_are_invalidated(): void
    {
        $defaultCredentials = [
            'admin@school.com' => '11111111',
            'teacher@school.com' => 'password',
            'test@example.com' => 'password',
        ];

        foreach ($defaultCredentials as $email => $password) {
            DB::table('users')->insert([
                'name' => $email,
                'email' => $email,
                'password' => Hash::make($password),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        DB::table('users')->insert([
            'name' => 'Custom account',
            'email' => 'custom@example.com',
            'password' => Hash::make('custom-password'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $migration = require database_path('migrations/2026_10_27_000000_invalidate_default_seeded_credentials.php');
        $migration->up();

        foreach ($defaultCredentials as $email => $password) {
            $storedPassword = DB::table('users')->where('email', $email)->value('password');
            $this->assertFalse(Hash::check($password, $storedPassword));
        }

        $customPassword = DB::table('users')->where('email', 'custom@example.com')->value('password');
        $this->assertTrue(Hash::check('custom-password', $customPassword));
    }
}
