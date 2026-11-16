<?php

namespace Tests\Feature;

use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Tests\TestCase;

class MenuRouteContractTest extends TestCase
{
    public function test_seeded_menu_links_resolve_to_get_routes_without_required_parameters(): void
    {
        $menuRoutes = [];
        foreach (glob(database_path('seeders/*MenuSeeder.php')) as $seeder) {
            preg_match_all("/'(?:route|route_name)'\s*=>\s*'([^']+)'/", file_get_contents($seeder), $matches);
            $menuRoutes = array_merge($menuRoutes, $matches[1]);
        }
        $failures = [];
        foreach (array_unique($menuRoutes) as $name) {
            $route = Route::getRoutes()->getByName($name);
            if (! $route) {
                $failures[] = "Missing menu route: {$name}";
            } elseif (! in_array('GET', $route->methods(), true)) {
                $failures[] = "Menu route does not accept GET: {$name}";
            } elseif (preg_match('/\{[^}?]+\}/', $route->uri())) {
                $failures[] = "Menu route requires a parameter: {$name}";
            }
        }

        $this->assertNotEmpty($menuRoutes);
        $this->assertSame([], $failures, implode("\n", $failures));
    }

    public function test_routes_are_not_shadowed_by_earlier_resources_or_catchall_routes(): void
    {
        $routes = Route::getRoutes();
        $failures = [];
        foreach ($routes as $route) {
            if ($route->getName() === 'dynamic.page') {
                continue;
            }
            $uri = '/'.ltrim(preg_replace('/\{[^}]+\}/', '123', $route->uri()), '/');
            if (! preg_match($route->toSymfonyRoute()->compile()->getRegex(), $uri)) {
                continue;
            }
            foreach (array_diff($route->methods(), ['HEAD']) as $method) {
                $matched = $routes->match(Request::create($uri, $method));
                if ($matched->getActionName() !== $route->getActionName()) {
                    $failures[] = $method.' '.$route->uri().' resolves to '.$matched->getName().' instead of '.$route->getName();
                }
            }
        }

        $this->assertSame([], $failures, implode("\n", $failures));
    }

    public function test_controller_model_parameters_have_matching_route_binding_names(): void
    {
        $failures = [];
        foreach (Route::getRoutes() as $route) {
            $action = $route->getActionName();
            if (! str_contains($action, '@')) {
                continue;
            }
            [$class, $method] = explode('@', $action, 2);
            if (! method_exists($class, $method)) {
                continue;
            }
            foreach ((new \ReflectionMethod($class, $method))->getParameters() as $parameter) {
                $type = $parameter->getType();
                if (! $type instanceof \ReflectionNamedType || $type->isBuiltin() || ! is_subclass_of($type->getName(), Model::class)) {
                    continue;
                }
                if (! in_array($parameter->getName(), $route->parameterNames(), true)
                    && ! in_array(Str::snake($parameter->getName()), $route->parameterNames(), true)) {
                    $failures[] = $route->getName().' cannot bind model parameter $'.$parameter->getName().' from '.$route->uri();
                }
            }
        }

        $this->assertSame([], $failures, implode("\n", $failures));
    }
}
