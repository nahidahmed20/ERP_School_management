<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DynamicPageController extends Controller
{
    public function __invoke(Request $request, string $any = '')
    {
        $routeName = str_replace('/', '.', trim($any, '/'));

        $menuItem = MenuItem::with('group')->where('route_name', $routeName)->first();

        abort_unless($menuItem, 404);

        return Inertia::render('ComingSoon', [
            'title' => $menuItem->label,
            'group' => optional($menuItem->group)->label,
        ]);
    }
}
