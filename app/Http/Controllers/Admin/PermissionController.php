<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use Inertia\Inertia;

class PermissionController extends Controller
{
    public function index(Request $request)
    {
        $query = Permission::query();

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $permissions = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/Permissions/Index', [
            'permissions' => $permissions,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate(['name' => 'required|string|unique:permissions,name']);
        Permission::create($validated);
        return back()->with('success', 'Permission created successfully.');
    }

    public function update(Request $request, Permission $permission)
    {
        $validated = $request->validate(['name' => 'required|string|unique:permissions,name,' . $permission->id]);
        $permission->update($validated);
        return back()->with('success', 'Permission updated successfully.');
    }

    public function destroy(Permission $permission)
    {
        $permission->delete();
        return back()->with('success', 'Permission deleted successfully.');
    }
}
