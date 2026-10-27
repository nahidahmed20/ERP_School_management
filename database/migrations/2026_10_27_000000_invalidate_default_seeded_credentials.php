<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        $defaultCredentials = [
            'admin@school.com' => '11111111',
            'teacher@school.com' => 'password',
            'test@example.com' => 'password',
        ];

        foreach ($defaultCredentials as $email => $defaultPassword) {
            $user = DB::table('users')->where('email', $email)->first(['id', 'password']);

            if ($user && Hash::check($defaultPassword, $user->password)) {
                DB::table('users')->where('id', $user->id)->update([
                    'password' => Hash::make(Str::random(64)),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        // Published default credentials must not be restored.
    }
};
