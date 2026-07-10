<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MenuGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class MenuGroupController extends Controller
{
    public function index()
    {
        return response()->json(MenuGroup::orderBy('order')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'label' => ['required', 'string', 'max:100'],
            'order' => ['nullable', 'integer'],
        ]);

        $group = MenuGroup::create($data);
        Cache::forget('sidebar.navigation');

        return back()->with('success', 'Group created.')->with('group', $group);
    }
}
