<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SystemRegistryController extends Controller
{
    public function index(Request $request)
    {
        $query = SystemLog::with('user:id,name');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('message', 'like', "%{$search}%")
                  ->orWhere('action', 'like', "%{$search}%");
            });
        }

        if ($request->filled('level')) {
            $query->where('level', $request->get('level'));
        }

        $query->latest();

        $perPage = $request->get('per_page', 10);
        $logs = $perPage === 'all'
            ? $query->get()
            : $query->paginate((int) $perPage)->withQueryString();

        return Inertia::render('Admin/Registry/Index', [
            'logs' => $perPage === 'all'
                ? ['data' => $logs, 'links' => [], 'meta' => ['total' => $logs->count()]]
                : $logs,
            'filters' => $request->only(['search', 'level', 'per_page']),
            'diagnostics' => $this->diagnostics(),
        ]);
    }

    public function destroy(SystemLog $log)
    {
        $log->delete();

        return back()->with('success', 'Log entry মুছে ফেলা হয়েছে।');
    }

    public function clear()
    {
        SystemLog::query()->delete();

        return back()->with('success', 'সব Log entry মুছে ফেলা হয়েছে।');
    }

    private function diagnostics(): array
    {
        return [
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'db_connection' => config('database.default'),
            'db_status' => $this->checkDb(),
            'cache_driver' => config('cache.default'),
            'queue_driver' => config('queue.default'),
            'storage_writable' => is_writable(storage_path()) ? 'ok' : 'fail',
            'debug_mode' => config('app.debug') ? 'on' : 'off',
            'environment' => config('app.env'),
            'server_time' => now()->toDateTimeString(),
        ];
    }

    private function checkDb(): string
    {
        try {
            DB::connection()->getPdo();
            return 'ok';
        } catch (\Throwable $e) {
            return 'fail';
        }
    }
}
