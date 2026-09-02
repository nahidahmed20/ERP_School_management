<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MenuGroup;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;

class MenuGroupController extends Controller
{
    public function index()
    {
        return response()->json(MenuGroup::orderBy('order')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'label' => ['required', 'string', 'max:100', 'unique:menu_groups,label'],
            'order' => ['nullable', 'integer'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $group = MenuGroup::create($data);
        Cache::forget('sidebar.navigation');

        return back()->with('success', 'Group created.')->with('group', $group);
    }

    public function update(Request $request, MenuGroup $menuGroup)
    {
        $data = $request->validate([
            'label' => ['required', 'string', 'max:100', Rule::unique('menu_groups', 'label')->ignore($menuGroup)],
            'order' => ['required', 'integer', 'min:0'],
            'is_active' => ['required', 'boolean'],
        ]);

        $menuGroup->update($data);

        return back()->with('success', 'Menu group updated successfully.');
    }

    public function destroy(MenuGroup $menuGroup)
    {
        abort_if(MenuItem::where('menu_group_id', $menuGroup->id)->exists(), 422, 'Move or delete this group’s menu items first.');
        $menuGroup->delete();

        return back()->with('success', 'Menu group deleted successfully.');
    }
}
