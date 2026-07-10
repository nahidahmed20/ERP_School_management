<?php

namespace App\Observers;

use App\Models\MenuGroup;
use Illuminate\Support\Facades\Cache;

class MenuGroupObserver
{
    public function created(MenuGroup $menuGroup): void
    {
        Cache::forget('sidebar.navigation');
    }

    public function updated(MenuGroup $menuGroup): void
    {
        Cache::forget('sidebar.navigation');
    }

    public function deleted(MenuGroup $menuGroup): void
    {
        Cache::forget('sidebar.navigation');
    }

    public function restored(MenuGroup $menuGroup): void
    {
        Cache::forget('sidebar.navigation');
    }

    public function forceDeleted(MenuGroup $menuGroup): void
    {
        Cache::forget('sidebar.navigation');
    }
}
