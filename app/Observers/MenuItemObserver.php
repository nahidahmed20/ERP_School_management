<?php

namespace App\Observers;

use App\Models\MenuItem;
use Illuminate\Support\Facades\Cache;

class MenuItemObserver
{
    public function created(MenuItem $menuItem): void
    {
        Cache::forget('sidebar.navigation');
    }

    public function updated(MenuItem $menuItem): void
    {
        Cache::forget('sidebar.navigation');
    }

    public function deleted(MenuItem $menuItem): void
    {
        Cache::forget('sidebar.navigation');
    }

    public function restored(MenuItem $menuItem): void
    {
        Cache::forget('sidebar.navigation');
    }

    public function forceDeleted(MenuItem $menuItem): void
    {
        Cache::forget('sidebar.navigation');
    }
}
