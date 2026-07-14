<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Campus;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{

    public function index(Request $request)
    {
        $query = User::withoutGlobalScope('campus')->with('roles');

        $activeCampusId = config('app.active_campus_id');

        if ($activeCampusId) {
            $query->where(function($q) use ($activeCampusId) {
                $q->where('campus_id', $activeCampusId);
                
                if (auth()->user()->hasRole('Super Admin')) {
                    $q->orWhereNull('campus_id'); 
                }
            });
        }

        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        $perPage = $request->get('per_page', 10);
        if ($perPage === 'all') {
            $users = $query->paginate($query->count() > 0 ? $query->count() : 10)->withQueryString();
        } else {
            $users = $query->paginate((int) $perPage)->withQueryString();
        }

        $rolesQuery = Role::query();
        if (!auth()->user()->hasRole('Super Admin')) {
            $rolesQuery->where('name', '!=', 'Super Admin');
        }
        $roles = $rolesQuery->get();
        $campuses = Campus::select('id', 'name')->get();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'roles' => $roles,
            'campuses' => $campuses,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', Password::defaults()],
            'campus_id' => 'required|exists:campuses,id' // Campus Selection
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'campus_id' => config('app.active_campus_id'),
        ]);

        if (isset($validated['roles'])) {
            $user->syncRoles($validated['roles']);
        }

        return back()->with('success', 'User created successfully.');
    }

    public function update(Request $request, User $user)
    {
        if ($user->hasRole('Super Admin')) {
            return back()->with('error', 'Super Admin cannot be modified.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'roles' => 'array',
            'campus_id' => 'required|exists:campuses,id', // Campus Update
            'password' => ['nullable', Password::defaults()]
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'campus_id' => $validated['campus_id'],
            'password' => $validated['password'] ? Hash::make($validated['password']) : $user->password,
        ]);

        $user->syncRoles($validated['roles'] ?? []);

        return back()->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        if ($user->hasRole('Super Admin')) {
            return back()->with('error', 'Super Admin cannot be deleted.');
        }

        $user->delete();
        return back()->with('success', 'User deleted successfully.');
    }
}