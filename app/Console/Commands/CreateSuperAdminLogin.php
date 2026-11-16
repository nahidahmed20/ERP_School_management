<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class CreateSuperAdminLogin extends Command
{
    protected $signature = 'app:super-admin-login {email? : Email address for the Super Admin login}';

    protected $description = 'Create or reset a Super Admin login securely';

    public function handle(): int
    {
        $email = Str::lower(trim((string) ($this->argument('email') ?: $this->ask('Super Admin email'))));

        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('Enter a valid email address.');

            return self::INVALID;
        }

        $password = $this->secret('New password (minimum 12 characters)');
        if (! is_string($password) || mb_strlen($password) < 12) {
            $this->error('Password must contain at least 12 characters.');

            return self::INVALID;
        }

        $confirmation = $this->secret('Confirm new password');
        if (! is_string($confirmation) || ! hash_equals($password, $confirmation)) {
            $this->error('The passwords do not match.');

            return self::INVALID;
        }

        $role = Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);
        $user = User::withoutGlobalScopes()
            ->whereRaw('LOWER(email) = ?', [$email])
            ->first();

        if (! $user) {
            $user = new User([
                'name' => 'Super Admin',
                'email' => $email,
                'email_verified_at' => now(),
                'campus_id' => null,
            ]);
        }

        $user->password = $password;
        $user->save();
        $user->assignRole($role);

        $this->info("Super Admin login is ready for {$email}.");
        $this->line('Select the School Management portal when signing in.');

        return self::SUCCESS;
    }
}
