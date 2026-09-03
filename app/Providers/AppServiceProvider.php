<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Models\MenuGroup;
use App\Models\MenuItem;
use App\Observers\MenuItemObserver;
use App\Observers\MenuGroupObserver;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Event;
use Illuminate\Database\Eloquent\Model;
use App\Models\SecurityAuditLog;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        JsonResource::withoutWrapping();

        Vite::prefetch(concurrency: 3);
        MenuItem::observe(MenuItemObserver::class);
        MenuGroup::observe(MenuGroupObserver::class);

        Gate::before(function ($user, $ability) {
            return $user->hasRole('Super Admin') ? true : null;
        });

        foreach (['created', 'updated', 'deleted'] as $action) {
            Event::listen("eloquent.{$action}: *", function (string $event, array $models) use ($action) {
                $model = $models[0] ?? null;
                if (app()->runningInConsole() || ! $model instanceof Model || $model instanceof SecurityAuditLog || ! $model->getKey()) {
                    return;
                }

                $hidden = ['password', 'remember_token', 'api_key', 'api_secret', 'webhook_secret', 'api_token_hash'];
                $sanitize = fn (array $values) => collect($values)->except($hidden)->map(
                    fn ($value) => is_string($value) && strlen($value) > 5000 ? substr($value, 0, 5000).'…' : $value
                )->all();
                $changes = $action === 'updated' ? $model->getChanges() : $model->getAttributes();
                $old = $action === 'created' ? null : $sanitize(
                    $action === 'updated'
                        ? collect($model->getOriginal())->only(array_keys($changes))->all()
                        : $model->getOriginal()
                );

                SecurityAuditLog::create([
                    'user_id' => auth()->id(),
                    'action' => $action,
                    'model_type' => $model::class,
                    'model_id' => $model->getKey(),
                    'old_values' => $old,
                    'new_values' => $action === 'deleted' ? null : $sanitize($changes),
                    'ip_address' => request()?->ip(),
                    'user_agent' => substr((string) request()?->userAgent(), 0, 1000),
                ]);
            });
        }
    }
}
