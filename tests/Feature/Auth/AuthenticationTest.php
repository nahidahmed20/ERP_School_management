<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $user = User::factory()->create();
        $user->assignRole(Role::create(['name' => 'Super Admin', 'guard_name' => 'web']));

        $response = $this->post('/login', [
            'login' => $user->email,
            'password' => 'password',
            'role' => 'admin',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
        $this->assertDatabaseHas('security_login_histories', ['user_id' => $user->id]);
    }

    public function test_students_can_authenticate_using_their_student_id(): void
    {
        $user = User::factory()->create();

        DB::table('students')->insert([
            'campus_id' => 1,
            'user_id' => $user->id,
            'guardian_id' => 1,
            'admission_no' => 'STU-2026-001',
            'admission_date' => now()->toDateString(),
            'first_name' => 'Test',
            'gender' => 'male',
            'date_of_birth' => now()->subYears(10)->toDateString(),
            'present_address' => 'Dhaka',
            'permanent_address' => 'Dhaka',
            'status' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->post('/login', [
            'login' => 'stu-2026-001',
            'password' => 'password',
            'role' => 'student',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create();
        $user->assignRole(Role::create(['name' => 'Super Admin', 'guard_name' => 'web']));

        $this->post('/login', [
            'login' => $user->email,
            'password' => 'wrong-password',
            'role' => 'admin',
        ]);

        $this->assertGuest();
        $this->assertDatabaseHas('security_failed_logins', ['email_attempted' => $user->email]);
    }

    public function test_users_can_not_authenticate_through_the_wrong_portal(): void
    {
        $user = User::factory()->create();

        $response = $this->post('/login', [
            'login' => $user->email,
            'password' => 'password',
            'role' => 'student',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('login');
    }

    public function test_login_requires_a_valid_portal_and_credentials(): void
    {
        $response = $this->post('/login', [
            'login' => '',
            'password' => '',
            'role' => 'invalid',
        ]);

        $response->assertSessionHasErrors(['login', 'password', 'role']);
        $this->assertGuest();
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }
}
