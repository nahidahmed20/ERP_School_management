<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\MenuItemController;
use App\Http\Controllers\Admin\MenuGroupController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\DynamicPageController;

Route::get('/test-role', function () {
    $user = auth()->user();
    return response()->json([
        'user_name' => $user->name,
        'roles' => $user->getRoleNames(), // ইউজারের কী কী রোল আছে তা দেখাবে
        'is_super_admin' => $user->hasRole('Super Admin') // true বা false দেখাবে
    ]);
});

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});
Route::middleware('auth') ->prefix('admin')->name('admin.')->group(function () {
    Route::get('/menu-manager', [MenuItemController::class, 'index'])->name('menu.index');
    Route::post('/menu-manager', [MenuItemController::class, 'store'])->name('menu.store');
    Route::put('/menu-manager/{menuItem}', [MenuItemController::class, 'update'])->name('menu.update');
    Route::delete('/menu-manager/{menuItem}', [MenuItemController::class, 'destroy'])->name('menu.destroy');
    Route::get('/menu-manager/export/excel', [MenuItemController::class, 'exportExcel'])->name('menu.export.excel');
    Route::get('/menu-manager/export/pdf', [MenuItemController::class, 'exportPdf'])->name('menu.export.pdf');
    Route::get('/menu-groups', [MenuGroupController::class, 'index'])->name('menu-groups.index');
    Route::post('/menu-groups', [MenuGroupController::class, 'store'])->name('menu-groups.store');

    Route::resource('users', UserController::class);
    Route::resource('roles', RoleController::class);
    Route::resource('permissions', PermissionController::class);
});




Route::middleware('auth')
    ->get('/{any}', DynamicPageController::class)
    ->where('any', '^(?!login|register|dashboard|profile|admin|logout).*$')
    ->name('dynamic.page');

require __DIR__.'/auth.php';
