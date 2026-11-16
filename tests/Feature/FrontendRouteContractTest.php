<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class FrontendRouteContractTest extends TestCase
{
    public function test_literal_frontend_route_names_are_registered(): void
    {
        $missing = [];
        foreach ($this->frontendSources() as $file => $source) {
            preg_match_all('/\broute\s*\(\s*([\'"])([a-zA-Z0-9_.:\-]+)\1/', $source, $matches, PREG_OFFSET_CAPTURE);
            foreach ($matches[2] as [$name, $offset]) {
                if (! Route::has($name)) {
                    $missing[] = $this->location($file, $source, $offset).': '.$name;
                }
            }
        }

        $this->assertSame([], $missing, "Unregistered literal frontend routes:\n".implode("\n", $missing));
    }

    public function test_direct_frontend_form_calls_use_supported_http_methods(): void
    {
        $mismatches = [];
        $methodsByUrl = [];
        foreach (Route::getRoutes()->getRoutes() as $registered) {
            $key = ($registered->getDomain() ?? '').'|'.$registered->uri();
            $methodsByUrl[$key] = array_unique(array_merge($methodsByUrl[$key] ?? [], $registered->methods()));
        }
        foreach ($this->frontendSources() as $file => $source) {
            preg_match_all('/\b(get|post|put|patch|delete)\s*\(\s*route\s*\(\s*([\'"])([a-zA-Z0-9_.:\-]+)\2/', $source, $matches, PREG_OFFSET_CAPTURE);
            foreach ($matches[3] as $index => [$name, $offset]) {
                $route = Route::getRoutes()->getByName($name);
                if (! $route) {
                    continue; // The route-name assertion reports this separately.
                }
                $method = strtoupper($matches[1][$index][0]);
                // A named GET and an unnamed POST may intentionally share a URL
                // (the standard Laravel login/register/password-confirmation routes).
                $urlKey = ($route->getDomain() ?? '').'|'.$route->uri();
                if (in_array($method, $methodsByUrl[$urlKey] ?? [], true)) {
                    continue;
                }
                // Multipart Inertia forms intentionally POST with Laravel's _method field.
                // Their payload transformations need behavioral tests, not a static guess.
                if ($method === 'POST' && str_contains($source, '_method')) {
                    continue;
                }
                $mismatches[] = $this->location($file, $source, $offset).': '.$method.' '.$name.' (registered '.implode('|', $route->methods()).')';
            }
        }

        $this->assertSame([], $mismatches, "Unsupported direct frontend form methods:\n".implode("\n", $mismatches));
    }

    public function test_literal_inertia_pages_have_react_components(): void
    {
        $missing = [];
        $pages = [];
        foreach (File::allFiles(resource_path('js/Pages')) as $pageFile) {
            if ($pageFile->getExtension() === 'jsx') {
                $pages[str_replace('\\', '/', substr($pageFile->getRelativePathname(), 0, -4))] = true;
            }
        }
        $registeredControllers = collect(Route::getRoutes()->getRoutes())
            ->map(fn ($route) => explode('@', $route->getActionName())[0])->unique()->all();
        foreach (File::allFiles(app_path('Http/Controllers')) as $file) {
            $source = File::get($file->getPathname());
            preg_match('/namespace\s+([^;]+);/', $source, $namespace);
            preg_match('/\bclass\s+(\w+)/', $source, $class);
            $controller = ($namespace[1] ?? '').'\\'.($class[1] ?? '');
            if (! in_array($controller, $registeredControllers, true)) {
                continue; // Unregistered legacy controllers cannot render a live Inertia page.
            }
            preg_match_all('/Inertia::render\s*\(\s*([\'"])([a-zA-Z0-9_\/\-]+)\1/', $source, $matches, PREG_OFFSET_CAPTURE);
            foreach ($matches[2] as [$page, $offset]) {
                // Compare the actual spelling even on Windows, where file_exists is case-insensitive.
                if (! isset($pages[$page])) {
                    $missing[] = $this->location($file->getPathname(), $source, $offset).': '.$page;
                }
            }
        }

        $this->assertSame([], $missing, "Inertia pages without matching JSX files:\n".implode("\n", $missing));
    }

    private function frontendSources(): iterable
    {
        foreach (File::allFiles(resource_path('js')) as $file) {
            if (in_array($file->getExtension(), ['js', 'jsx', 'mjs'], true)) {
                yield $file->getPathname() => File::get($file->getPathname());
            }
        }
    }

    private function location(string $file, string $source, int $offset): string
    {
        return str_replace('\\', '/', str_replace(base_path().DIRECTORY_SEPARATOR, '', $file))
            .':'.(substr_count(substr($source, 0, $offset), "\n") + 1);
    }
}
