<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMenuItemRequest;
use App\Http\Requests\UpdateMenuItemRequest;
use App\Models\MenuGroup;
use App\Models\MenuItem;
use App\Exports\MenuItemsExport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

class MenuItemController extends Controller
{
    public function index(Request $request)
    {
        $query = MenuItem::with(['group', 'parent']);

        if ($search = $request->string('search')->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('label', 'like', "%{$search}%")
                ->orWhere('key', 'like', "%{$search}%")
                ->orWhere('route_name', 'like', "%{$search}%");
            });
        }

        if ($groupId = $request->input('group_id')) {
            $query->where('menu_group_id', $groupId);
        }

        if ($request->filled('type')) {
            $request->input('type') === 'parent'
                ? $query->whereNull('parent_id')
                : $query->whereNotNull('parent_id');
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->input('status') === 'active');
        }

        // --- per_page handling ---
        $allowedPerPage = ['10', '20', '50', '100', '500', '1000'];
        $perPageInput   = (string) $request->input('per_page', '10');

        if ($perPageInput === 'all') {
            $total    = (clone $query)->count();
            $perPage  = max($total, 1); // avoid paginate(0) error when table is empty
        } else {
            $perPage = in_array($perPageInput, $allowedPerPage, true)
                ? (int) $perPageInput
                : 10;
        }

        $items = $query->orderBy('menu_group_id')
                        ->orderBy('order')
                        ->paginate($perPage)
                        ->withQueryString()
                        ->through(fn ($item) => [
                            'id'          => $item->id,
                            'menu_group_id' => $item->menu_group_id,
                            'group'       => $item->group->label ?? '—',
                            'parent_id'   => $item->parent_id,
                            'parent'      => $item->parent->label ?? null,
                            'key'         => $item->key,
                            'label'       => $item->label,
                            'icon'        => $item->icon,
                            'route_name'  => $item->route_name,
                            'badge_count' => $item->badge_count,
                            'order'       => $item->order,
                            'is_active'   => $item->is_active,
                        ]);

        return Inertia::render('Admin/MenuManager/Index', [
            'items'      => $items,
            'groups'     => MenuGroup::orderBy('order')->get(['id', 'label']),
            'parents'    => MenuItem::whereNull('parent_id')->get(['id', 'label', 'menu_group_id']),
            'filters'    => $request->only('search', 'group_id', 'type', 'status', 'per_page'),
        ]);
    }

    public function store(StoreMenuItemRequest $request)
    {
        MenuItem::create($request->validated());
        Cache::forget('sidebar.navigation');

        return back()->with('success', 'Menu item created successfully.');
    }

    public function update(UpdateMenuItemRequest $request, MenuItem $menuItem)
    {
        $menuItem->update($request->validated());
        Cache::forget('sidebar.navigation');

        return back()->with('success', 'Menu item updated successfully.');
    }

    public function destroy(MenuItem $menuItem)
    {
        $menuItem->delete(); // children auto-delete via cascadeOnDelete
        Cache::forget('sidebar.navigation');

        return back()->with('success', 'Menu item deleted successfully.');
    }

    public function exportExcel()
    {
        return Excel::download(new MenuItemsExport, 'menu-items-' . now()->format('Y-m-d') . '.xlsx');
    }

    public function exportPdf()
    {
        $items = MenuItem::with(['group', 'parent'])->orderBy('menu_group_id')->orderBy('order')->get();
        $pdf = Pdf::loadView('exports.menu-items-pdf', ['items' => $items])->setPaper('a4', 'landscape');

        return $pdf->download('menu-items-' . now()->format('Y-m-d') . '.pdf');
    }
}
