<?php

namespace Tests\Feature;

use App\Models\{Campus, Setting, User};
use App\Services\WebsiteSettingsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\{DB, Storage};
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\{Permission, Role};
use Tests\TestCase;

class BrandingAndProfileWorkflowTest extends TestCase
{
    use RefreshDatabase;

    private function administrator(): User
    {
        $user = User::factory()->create(['campus_id' => null]);
        $user->assignRole(Role::findOrCreate('Super Admin', 'web'));
        return $user;
    }

    private function brandingData(): array
    {
        return ['school_name' => 'Example School', 'school_short_name' => 'Example'];
    }

    public function test_logo_can_be_saved_without_selecting_a_campus_and_is_shared_with_public_and_admin_pages(): void
    {
        Storage::fake('public');
        $this->actingAs($this->administrator())->post(route('admin.general.website.update'), $this->brandingData() + [
            'logo' => UploadedFile::fake()->image('logo.png', 120, 120),
        ])->assertSessionHasNoErrors();

        $logo = Setting::withoutGlobalScope('campus')->whereNull('campus_id')->where('key', 'logo')->firstOrFail();
        Storage::disk('public')->assertExists($logo->value);
        app(WebsiteSettingsService::class)->clearCache();
        $expected = '/storage/'.$logo->value;
        $this->get(route('admin.general.index'))->assertInertia(fn (Assert $page) => $page
            ->where('site_settings.logo', $expected)->where('canManageBranding', true));
        $this->get(route('site.contact'))->assertInertia(fn (Assert $page) => $page->where('site_settings.logo', $expected));
    }

    public function test_selected_campus_cannot_capture_or_overwrite_global_branding(): void
    {
        $campus = Campus::create(['name' => 'Branch', 'code' => 'BR']);
        Setting::create(['campus_id' => $campus->id, 'key' => 'school_name', 'label' => 'Local school', 'value' => 'Branch Name']);
        $this->actingAs($this->administrator())->withSession(['active_campus_id' => $campus->id])
            ->post(route('admin.general.website.update'), $this->brandingData())->assertSessionHasNoErrors();

        $this->assertDatabaseHas('settings', ['campus_id' => null, 'key' => 'school_name', 'value' => 'Example School']);
        $this->assertDatabaseHas('settings', ['campus_id' => $campus->id, 'key' => 'school_name', 'value' => 'Branch Name']);
        $this->assertSame(1, Setting::withoutGlobalScope('campus')->whereNull('campus_id')->where('key', 'school_name')->count());
    }

    public function test_logo_replacement_and_removal_preserve_unrelated_images(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('branding/old.png', 'old logo');
        Storage::disk('public')->put('students/portrait.png', 'student photo');
        Setting::create(['campus_id' => null, 'key' => 'logo', 'group' => 'website', 'label' => 'Logo', 'value' => 'branding/old.png']);
        $this->actingAs($this->administrator())->post(route('admin.general.website.update'), $this->brandingData() + [
            'logo' => UploadedFile::fake()->image('replacement.png'),
        ])->assertSessionHasNoErrors();
        $newPath = Setting::withoutGlobalScope('campus')->where('key', 'logo')->value('value');
        Storage::disk('public')->assertMissing('branding/old.png');
        Storage::disk('public')->assertExists($newPath);

        $this->post(route('admin.general.website.update'), $this->brandingData() + ['remove_logo' => true])->assertSessionHasNoErrors();
        Storage::disk('public')->assertMissing($newPath);
        Storage::disk('public')->assertExists('students/portrait.png');
        $this->assertDatabaseHas('settings', ['key' => 'logo', 'campus_id' => null, 'value' => null]);
    }

    public function test_invalid_upload_does_not_change_existing_branding(): void
    {
        Storage::fake('public');
        Setting::create(['campus_id' => null, 'key' => 'school_name', 'label' => 'School', 'value' => 'Original']);
        $this->actingAs($this->administrator())->post(route('admin.general.website.update'), $this->brandingData() + [
            'logo' => UploadedFile::fake()->createWithContent('logo.php', '<?php echo "invalid";'),
        ])->assertSessionHasErrors('logo');
        $this->assertDatabaseHas('settings', ['key' => 'school_name', 'value' => 'Original']);
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_branch_operator_cannot_modify_all_campus_branding_even_with_route_permission(): void
    {
        $campus = Campus::create(['name' => 'Branch', 'code' => 'BR']);
        $user = User::factory()->create(['campus_id' => $campus->id]);
        $user->givePermissionTo(Permission::findOrCreate('admin.general.website.update', 'web'));
        $this->actingAs($user)->post(route('admin.general.website.update'), $this->brandingData())->assertForbidden();
        $this->assertDatabaseMissing('settings', ['key' => 'school_name']);
    }

    public function test_topbar_permission_props_include_role_permissions_without_exposing_forbidden_actions(): void
    {
        $role = Role::findOrCreate('Operator', 'web');
        $role->givePermissionTo(Permission::findOrCreate('admin.staff.index', 'web'));
        $user = User::factory()->create();
        $user->assignRole($role);
        $this->actingAs($user)->get(route('profile.edit'))->assertInertia(fn (Assert $page) => $page
            ->where('auth.topbar_permissions', fn ($permissions) => $permissions['admin.staff.index'] === true
                && $permissions['admin.students.index'] === false && $permissions['admin.general.index'] === false));
    }

    public function test_profile_can_revoke_only_own_other_sessions_after_password_confirmation(): void
    {
        config(['session.driver' => 'database']);
        $user = User::factory()->create(['remember_token' => 'old-token']);
        $other = User::factory()->create();
        $this->actingAs($user)->withSession(['profile-test' => true]);
        $currentId = session()->getId();
        $this->withCookie(config('session.cookie'), $currentId);
        foreach ([[$currentId, $user->id], ['other-device', $user->id], ['another-user', $other->id]] as [$id, $owner]) {
            DB::table('sessions')->updateOrInsert(['id' => $id], ['user_id' => $owner, 'payload' => base64_encode(serialize([])), 'last_activity' => time()]);
        }

        $this->delete(route('profile.sessions.destroy'), ['password' => 'wrong'])->assertSessionHasErrors('password');
        $this->assertDatabaseHas('sessions', ['id' => 'other-device']);
        $this->delete(route('profile.sessions.destroy'), ['password' => 'password'])->assertSessionHasNoErrors();
        $this->assertDatabaseMissing('sessions', ['id' => 'other-device']);
        $this->assertDatabaseHas('sessions', ['id' => 'another-user']);
        $this->assertDatabaseHas('sessions', ['id' => $currentId]);
        $this->assertNotSame('old-token', $user->fresh()->remember_token);
        $this->assertAuthenticatedAs($user);
    }
}
