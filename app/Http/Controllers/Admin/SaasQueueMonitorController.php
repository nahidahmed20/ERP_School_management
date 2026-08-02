<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SaasQueueMonitor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SaasQueueMonitorController extends Controller
{
    public function index(Request $request)
    {
        $query = SaasQueueMonitor::query();

        if ($search = $request->get('search')) {
            $query->where('job_name', 'like', "%{$search}%")
                  ->orWhere('queue_name', 'like', "%{$search}%");
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        $perPageRaw = $request->get('per_page', '50');

        if ($perPageRaw === 'All') {
            $totalCount = max($query->count(), 1);
            $jobs = $query->latest()->paginate($totalCount)->withQueryString();
        } else {
            $jobs = $query->latest()->paginate((int) $perPageRaw)->withQueryString();
        }

        return Inertia::render('Admin/SaaS/Queue/Index', [
            'jobs' => $jobs,
            'filters' => [
                'search' => $request->get('search', ''),
                'status' => $request->get('status', ''),
                'per_page' => $perPageRaw,
            ],
        ]);
    }

    public function destroy($id)
    {
        SaasQueueMonitor::findOrFail($id)->delete();
        return back()->with('success', 'Queue log removed successfully.');
    }
}
