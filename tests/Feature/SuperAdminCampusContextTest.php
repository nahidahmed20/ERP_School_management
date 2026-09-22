<?php

namespace Tests\Feature;

use App\Http\Middleware\SetActiveCampus;
use App\Models\{Campus, Setting, User, Vendor};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\{Auth, Route};
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\{Permission, Role};
use Tests\TestCase;

class SuperAdminCampusContextTest extends TestCase
{
    use RefreshDatabase;

    private function superAdmin(): User
    {
        $user = User::factory()->create(['campus_id' => null]);
        $user->assignRole(Role::findOrCreate('Super Admin', 'web'));

        return $user;
    }

    private function campuses(): array
    {
        return [
            Campus::create(['name' => 'Main Campus', 'code' => 'MAIN', 'is_main' => true]),
            Campus::create(['name' => 'North Campus', 'code' => 'NORTH']),
        ];
    }

    private function sessionLogin(User $user, ?Campus $campus = null): void
    {
        $loginKey = Auth::guard('web')->getName();
        Auth::forgetGuards();
        $this->withSession([$loginKey => $user->id, 'active_campus_id' => $campus?->id]);
    }

    public function test_campus_middleware_runs_after_session_and_before_bindings(): void
    {
        $route = Route::getRoutes()->getByName('admin.users.update');
        $stack = app('router')->gatherRouteMiddleware($route);

        $this->assertLessThan(array_search(SetActiveCampus::class, $stack), array_search(\Illuminate\Session\Middleware\StartSession::class, $stack));
        $this->assertLessThan(array_search(\Illuminate\Routing\Middleware\SubstituteBindings::class, $stack), array_search(SetActiveCampus::class, $stack));
    }

    public function test_unassigned_super_admin_can_select_campus_and_create_using_real_session_authentication(): void
    {
        [, $north] = $this->campuses();
        $user = $this->superAdmin();
        $this->sessionLogin($user);

        $this->post(route('admin.campus.switch'), ['campus_id' => $north->id])
            ->assertRedirect(route('dashboard'))->assertSessionHas('active_campus_id', $north->id);

        // Simulate the next HTTP request resolving the user from the session,
        // rather than hiding authentication ordering bugs with actingAs().
        Auth::forgetGuards();
        $this->post(route('admin.purchase.vendors.store'), ['name' => 'North Supplier', 'phone' => '01700000001'])
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('vendors', ['name' => 'North Supplier', 'campus_id' => $north->id]);
        $this->assertDatabaseHas('users', ['id' => $user->id, 'campus_id' => null]);
        $this->assertNull(config('app.active_campus_id'), 'Request context must not leak into the next request.');
    }

    public function test_missing_selection_never_defaults_to_main_campus(): void
    {
        $this->campuses();
        $this->sessionLogin($this->superAdmin());

        $this->post(route('admin.purchase.vendors.store'), ['name' => 'Must Not Save', 'phone' => '01700000002'])
            ->assertSessionHasErrors('campus_id')->assertSessionMissing('active_campus_id');

        $this->assertDatabaseMissing('vendors', ['name' => 'Must Not Save']);
    }

    public function test_stale_form_cannot_silently_create_in_another_campus(): void
    {
        [$main, $north] = $this->campuses();
        $this->sessionLogin($this->superAdmin(), $north);

        $this->post(route('admin.purchase.vendors.store'), ['campus_id' => $main->id, 'name' => 'Old Form', 'phone' => '01700000003'])
            ->assertSessionHasErrors('campus_id');

        $this->assertDatabaseMissing('vendors', ['name' => 'Old Form']);
    }

    public function test_invalid_and_inactive_campuses_cannot_be_selected(): void
    {
        [$main, $north] = $this->campuses();
        $north->update(['is_active' => false]);
        $this->sessionLogin($this->superAdmin(), $main);

        foreach ([null, '', 999999, $north->id] as $invalid) {
            $this->post(route('admin.campus.switch'), ['campus_id' => $invalid])
                ->assertSessionHasErrors('campus_id')->assertSessionHas('active_campus_id', $main->id);
        }
    }

    public function test_a_disabled_selected_campus_is_cleared_instead_of_falling_back(): void
    {
        [, $north] = $this->campuses();
        $north->update(['is_active' => false]);
        $this->sessionLogin($this->superAdmin(), $north);

        $this->post(route('admin.purchase.vendors.store'), ['name' => 'Disabled', 'phone' => '01700000004'])
            ->assertSessionHasErrors('campus_id')->assertSessionMissing('active_campus_id');
        $this->assertDatabaseMissing('vendors', ['name' => 'Disabled']);
    }

    public function test_shared_props_and_results_follow_the_working_campus(): void
    {
        [$main, $north] = $this->campuses();
        Campus::create(['name' => 'Closed Campus', 'code' => 'CLOSED', 'is_active' => false]);
        Vendor::create(['campus_id' => $main->id, 'name' => 'Main Only', 'phone' => '1']);
        Vendor::create(['campus_id' => $north->id, 'name' => 'North Only', 'phone' => '2']);
        Setting::create(['campus_id' => null, 'key' => 'school_name', 'value' => 'Global School', 'label' => 'School name']);
        $this->sessionLogin($this->superAdmin(), $north);

        $this->get(route('admin.purchase.vendors.index'))->assertInertia(fn (Assert $page) => $page
            ->where('auth.user.campus_id', null)
            ->where('auth.can_switch_campus', true)
            ->where('auth.active_campus_id', $north->id)
            ->where('auth.active_campus.name', 'North Campus')
            ->where('auth.requires_campus_selection', false)
            ->where('global_settings.school_name', 'Global School')
            ->has('all_campuses', 2)
            ->has('vendors.data', 1)->where('vendors.data.0.name', 'North Only')
        );
    }

    public function test_branch_admin_ignores_forged_session_and_form_campus(): void
    {
        [$main, $north] = $this->campuses();
        $user = User::factory()->create(['campus_id' => $main->id]);
        $user->givePermissionTo(Permission::findOrCreate('admin.purchase.vendors.store', 'web'));
        // Even granting endpoint permission does not grant switching authority.
        $user->givePermissionTo(Permission::findOrCreate('admin.campus.switch', 'web'));
        $this->sessionLogin($user, $north);

        $this->post(route('admin.purchase.vendors.store'), ['campus_id' => $north->id, 'name' => 'Own Branch', 'phone' => '3'])
            ->assertSessionHasNoErrors()->assertSessionHas('active_campus_id', $main->id);
        $this->assertDatabaseHas('vendors', ['name' => 'Own Branch', 'campus_id' => $main->id]);
        $this->post(route('admin.campus.switch'), ['campus_id' => $north->id])->assertForbidden();
    }

    public function test_binding_rejects_other_campus_before_an_update(): void
    {
        [$main, $north] = $this->campuses();
        $target = User::factory()->create(['campus_id' => $main->id]);
        $this->sessionLogin($this->superAdmin(), $north);

        $this->put(route('admin.users.update', $target), [])->assertNotFound();
    }

    public function test_central_campus_provisioning_does_not_require_working_campus(): void
    {
        $this->sessionLogin($this->superAdmin());
        $this->post(route('admin.campuses.store'), ['name' => 'First Branch', 'code' => 'FIRST', 'is_active' => true])
            ->assertSessionHasNoErrors();
        $this->assertDatabaseHas('campuses', ['code' => 'FIRST']);
    }

    public function test_explicit_user_branch_assignment_is_not_overwritten_by_working_campus(): void
    {
        [$main, $north] = $this->campuses();
        Role::findOrCreate('Teacher', 'web');
        $this->sessionLogin($this->superAdmin(), $main);

        $this->post(route('admin.users.store'), [
            'name' => 'North User', 'email' => 'north@example.test',
            'password' => 'Password123!', 'roles' => ['Teacher'], 'campus_id' => $north->id,
        ])->assertSessionHasNoErrors();
        $this->assertDatabaseHas('users', ['email' => 'north@example.test', 'campus_id' => $north->id]);
    }
}
