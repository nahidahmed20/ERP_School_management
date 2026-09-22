<?php

namespace Tests\Feature;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use ReflectionMethod;
use Tests\TestCase;

class RouteContractTest extends TestCase
{
    public function test_registered_application_controller_actions_exist_and_are_public(): void
    {
        $problems = [];
        foreach (Route::getRoutes() as $route) {
            $action = $route->getActionName();
            if (! str_starts_with($action, 'App\\Http\\Controllers\\')) continue;
            [$controller, $method] = explode('@', $action) + [1 => '__invoke'];
            if (! method_exists($controller, $method) || ! (new ReflectionMethod($controller, $method))->isPublic()) {
                $problems[] = $route->getName().' ['.implode('|', $route->methods()).' '.$route->uri().'] => '.$action;
            }
        }
        $this->assertCount(0, $problems, "Routes with missing/non-public controller methods:\n".implode("\n", $problems));
    }

    public function test_static_application_routes_are_not_shadowed_by_resource_parameters(): void
    {
        $problems = [];
        foreach (Route::getRoutes() as $route) {
            if ($route->getDomain() || str_contains($route->uri(), '{') || ! str_starts_with($route->getActionName(), 'App\\')) continue;
            foreach (array_diff($route->methods(), ['HEAD']) as $method) {
                $resolved = app('router')->getRoutes()->match(Request::create('/'.ltrim($route->uri(), '/'), $method));
                if ($resolved->getName() !== $route->getName()) {
                    $problems[] = $method.' '.$route->uri().' expected '.$route->getName().' but matched '.$resolved->getName();
                }
            }
        }
        $this->assertSame([], $problems, implode("\n", $problems));
    }
}
