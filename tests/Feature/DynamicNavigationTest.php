<?php

namespace Tests\Feature;

use App\Models\MenuGroup;
use App\Models\MenuItem;
use App\Models\User;
use App\Services\NavigationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class DynamicNavigationTest extends TestCase
{
    use RefreshDatabase;

    public function test_navigation_only_contains_active_groups_and_items(): void
    {
        $visibleGroup = MenuGroup::create(['label' => 'Visible', 'order' => 1, 'is_active' => true]);
        $hiddenGroup = MenuGroup::create(['label' => 'Hidden', 'order' => 2, 'is_active' => false]);

        MenuItem::create(['menu_group_id' => $visibleGroup->id, 'key' => 'visible', 'label' => 'Visible', 'route_name' => 'dashboard', 'is_active' => true]);
        MenuItem::create(['menu_group_id' => $visibleGroup->id, 'key' => 'hidden-item', 'label' => 'Hidden item', 'route_name' => 'dashboard', 'is_active' => false]);
        MenuItem::create(['menu_group_id' => $hiddenGroup->id, 'key' => 'hidden-group-item', 'label' => 'Hidden group item', 'route_name' => 'dashboard']);

        $navigation = app(NavigationService::class)->getMenu();

        $this->assertCount(1, $navigation);
        $this->assertSame('Visible', $navigation[0]['label']);
        $this->assertCount(1, $navigation[0]['items']);
    }

    public function test_super_admin_can_hide_and_show_a_menu_group(): void
    {
        $user = User::factory()->create();
        $user->assignRole(Role::create(['name' => 'Super Admin', 'guard_name' => 'web']));
        $group = MenuGroup::create(['label' => 'Academics', 'order' => 1, 'is_active' => true]);

        $this->actingAs($user)->put(route('admin.menu-groups.update', $group), [
            'label' => 'Academics',
            'order' => 1,
            'is_active' => false,
        ])->assertRedirect();

        $this->assertFalse($group->fresh()->is_active);
    }

    public function test_creating_a_menu_item_automatically_creates_its_permission(): void
    {
        $group = MenuGroup::create(['label' => 'New Module', 'order' => 1, 'is_active' => true]);

        $item = MenuItem::create([
            'menu_group_id' => $group->id,
            'key' => 'new-module',
            'label' => 'New Module',
            'route_name' => 'admin.new-module.index',
        ]);

        $this->assertSame('admin.new-module.index', $item->fresh()->permission);
        $this->assertTrue(Permission::where('name', 'admin.new-module.index')->exists());
    }

    public function test_every_seeded_menu_link_points_to_a_registered_route(): void
    {
        $this->seed(\Database\Seeders\MenuSeeder::class);

        $broken = MenuItem::query()
            ->whereNotNull('route_name')
            ->pluck('route_name')
            ->reject(fn (string $routeName) => Route::has($routeName))
            ->values()
            ->all();

        $this->assertSame([], $broken, 'Broken menu routes: '.implode(', ', $broken));
    }
}
