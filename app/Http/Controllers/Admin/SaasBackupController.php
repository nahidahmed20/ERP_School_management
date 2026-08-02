<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SaasBackup;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SaasBackupController extends Controller
{
    public function index(Request $request)
    {
        $query = SaasBackup::query();

        if ($search = $request->get('search')) {
            $query->where('file_name', 'like', "%{$search}%")
                  ->orWhere('type', 'like', "%{$search}%");
        }

        $perPageRaw = $request->get('per_page', '10');

        if ($perPageRaw === 'All') {
            $totalCount = max($query->count(), 1);
            $backups = $query->latest()->paginate($totalCount)->withQueryString();
        } else {
            $backups = $query->latest()->paginate((int) $perPageRaw)->withQueryString();
        }

        return Inertia::render('Admin/SaaS/Backups/Index', [
            'backups' => $backups,
            'filters' => [
                'search' => $request->get('search', ''),
                'per_page' => $perPageRaw,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string|in:Database,Files,Full Backup',
        ]);

        $fileName = 'backup_' . strtolower(str_replace(' ', '_', $validated['type'])) . '_' . date('Y_m_d_His') . '.zip';

        SaasBackup::create([
            'file_name' => $fileName,
            'type' => $validated['type'],
            'status' => 'Pending',
        ]);

        return back()->with('success', 'Backup generation started in the background.');
    }

    public function destroy($id)
    {
        SaasBackup::findOrFail($id)->delete();
        return back()->with('success', 'Backup file deleted successfully.');
    }
}
