<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{SaasBackup, User};
use App\Services\SecureBackupService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Artisan, DB, Hash, Storage, Schema};
use Inertia\Inertia;
use ZipArchive;
use Throwable;

class SecurityOperationsController extends Controller
{
    /**
     * Display the Security Operations Dashboard.
     */
    public function index(Request $request)
    {
        $sessions = DB::table('sessions')
            ->leftJoin('users', 'users.id', '=', 'sessions.user_id')
            ->select('sessions.id', 'sessions.user_id', 'users.name', 'sessions.ip_address', 'sessions.user_agent', 'sessions.last_activity')
            ->orderByDesc('sessions.last_activity')
            ->take(200)
            ->get();

        return Inertia::render('Admin/SecurityOperations/Index', [
            'users' => User::with('roles:id,name')->get(['id', 'name', 'email', 'two_factor_enabled', 'password_changed_at', 'password_expires_days', 'locked_until']),
            'sessions' => $sessions,
            'backups' => SaasBackup::latest()->take(50)->get(),
            'failedJobs' => DB::table('failed_jobs')->latest('failed_at')->take(100)->get(),
            'queueCount' => DB::table('jobs')->count(),
            // 'errors' পরিবর্তন করে 'systemErrors' করা হয়েছে যাতে Inertia-এর সাথে কনফ্লিক্ট না করে
            'systemErrors' => DB::table('system_error_events')->latest('occurred_at')->take(100)->get(),
            'health' => DB::table('system_health_checks')->latest('checked_at')->take(30)->get(),
            'retention' => DB::table('data_retention_runs')->latest('executed_at')->take(30)->get(),
            'drTests' => DB::table('disaster_recovery_tests')->latest('tested_at')->take(30)->get()
        ]);
    }

    /**
     * Update a user's security policy.
     */
    public function userPolicy(Request $request, User $user)
    {
        $data = $request->validate([
            'two_factor_enabled' => 'boolean',
            'password_expires_days' => 'nullable|integer|min:1|max:365',
            'unlock' => 'boolean'
        ]);

        $user->update([
            'two_factor_enabled' => $data['two_factor_enabled'] ?? false,
            'password_expires_days' => $data['password_expires_days'] ?? null,
            'locked_until' => ($data['unlock'] ?? false) ? null : $user->locked_until
        ]);

        return back()->with('success', 'User security policy updated.');
    }

    /**
     * Revoke a specific active session.
     */
    public function revokeSession(Request $request, string $id)
    {
        abort_if($id === $request->session()->getId(), 422, 'Current session cannot be revoked here.');

        DB::table('sessions')->where('id', $id)->delete();

        return back()->with('success', 'Session revoked successfully.');
    }

    /**
     * Create a new secure backup.
     */
    public function backup(Request $request, SecureBackupService $backupService)
    {
        $data = $request->validate([
            'type' => 'required|in:Database,Files,Full Backup'
        ]);

        $backup = SaasBackup::create([
            'file_name' => 'backup_' . strtolower(str_replace(' ', '_', $data['type'])) . '_' . now()->format('Y_m_d_His') . '.zip',
            'type' => $data['type'],
            'status' => 'Pending',
            'created_by' => $request->user()->id
        ]);

        try {
            $backupService->create($backup);
        } catch (Throwable $e) {
            $backup->update(['status' => 'Failed', 'error_message' => $e->getMessage()]);
            report($e);
            return back()->with('error', 'Backup failed: ' . $e->getMessage());
        }

        return back()->with('success', 'Encrypted backup created and checksummed.');
    }

    /**
     * Verify backup archive and checksum.
     */
    public function verify(Request $request, SaasBackup $backup, SecureBackupService $backupService)
    {
        $isValid = $backupService->verify($backup);

        DB::table('disaster_recovery_tests')->insert([
            'saas_backup_id' => $backup->id,
            'status' => $isValid ? 'passed' : 'failed',
            'checksum_status' => $isValid ? 'valid' : 'invalid',
            'details' => $isValid ? 'Archive exists and SHA-256 checksum matches.' : 'Archive missing or checksum mismatch.',
            'tested_at' => now(),
            'tested_by' => $request->user()->id,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return back()->with($isValid ? 'success' : 'error', $isValid ? 'Disaster recovery verification passed.' : 'Backup verification failed.');
    }

    /**
     * Restore database from a backup.
     */
    /**
     * Restore database from a backup.
     */
    public function restore(Request $request, SaasBackup $backup, SecureBackupService $backupService)
    {
        $request->validate([
            'confirmation' => 'required|in:RESTORE',
            'password' => 'required|current_password'
        ], [
            'password.current_password' => 'The password you entered is incorrect.'
        ]);

        if (!$backupService->verify($backup)) {
            return back()->with('error', 'Backup checksum failed. The archive may be corrupted.');
        }

        if (!str_contains(strtolower($backup->type), 'database') && !str_contains(strtolower($backup->type), 'full')) {
            return back()->with('error', 'This backup does not contain a database payload.');
        }

        try {
            $tmpPath = tempnam(sys_get_temp_dir(), 'erp_restore_');
            file_put_contents($tmpPath, Storage::disk($backup->disk)->get($backup->path));

            $zip = new ZipArchive();
            if ($zip->open($tmpPath) !== true) {
                throw new \Exception('Cannot open the backup archive.');
            }

            $zip->setPassword(config('app.key'));
            $jsonPayload = $zip->getFromName('database.json');
            $zip->close();
            @unlink($tmpPath);

            if (!$jsonPayload) {
                throw new \Exception('Database payload unavailable. Encryption key mismatch.');
            }

            $payload = json_decode($jsonPayload, true, 512, JSON_THROW_ON_ERROR);

            DB::transaction(function () use ($payload) {
                DB::statement('SET FOREIGN_KEY_CHECKS=0');
                
                try {
                    foreach ($payload['tables'] as $table => $rows) {
                        if (!Schema::hasTable($table) || in_array($table, ['migrations', 'sessions', 'jobs', 'failed_jobs'])) {
                            continue;
                        }
                        
                        DB::table($table)->delete(); 
                        
                        foreach (array_chunk($rows, 200) as $chunk) {
                            DB::table($table)->insert($chunk);
                        }
                    }
                } finally {
                    DB::statement('SET FOREIGN_KEY_CHECKS=1');
                }
            });

            DB::table('disaster_recovery_tests')->insert([
                'saas_backup_id' => $backup->id,
                'status' => 'passed',
                'checksum_status' => 'valid',
                'details' => 'Authorized in-place database restore completed successfully.',
                'tested_at' => now(),
                'tested_by' => $request->user()->id,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return back()->with('success', 'Database restored successfully from backup!');

        } catch (\Throwable $e) {
            return back()->with('error', 'Restore Error: ' . $e->getMessage());
        }
    }

    /**
     * Download the encrypted backup file.
     */
    public function download(SaasBackup $backup)
    {
        if (!$backup->disk || !$backup->path || !Storage::disk($backup->disk)->exists($backup->path)) {
            return back()->with('error', 'Backup file not found on the server.');
        }

        return Storage::disk($backup->disk)->download($backup->path, $backup->file_name);
    }

    /**
     * Run system health checks.
     */
    public function health(Request $request)
    {
        $checks = [];
        $startTime = microtime(true);

        // Check Database
        try {
            DB::select('SELECT 1');
            $checks[] = ['database', 'healthy', null];
        } catch (Throwable $e) {
            $checks[] = ['database', 'critical', $e->getMessage()];
        }

        // Check Storage
        $checks[] = ['storage', is_writable(storage_path()) ? 'healthy' : 'critical', is_writable(storage_path()) ? null : 'Storage is not writable'];

        // Check Queue
        $failedQueueCount = DB::table('failed_jobs')->where('failed_at', '>=', now()->subHour())->count();
        $checks[] = ['queue', $failedQueueCount > 10 ? 'warning' : 'healthy', 'Failed jobs in last hour: ' . $failedQueueCount];

        // Insert Logs
        foreach ($checks as [$component, $status, $message]) {
            DB::table('system_health_checks')->insert([
                'component' => $component,
                'status' => $status,
                'response_ms' => (int)((microtime(true) - $startTime) * 1000),
                'message' => $message,
                'checked_at' => now(),
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        return back()->with('success', 'System health checks completed.');
    }

    /**
     * Retry a failed queue job.
     */
    public function retryJob(string $id)
    {
        Artisan::call('queue:retry', [$id]);

        return back()->with('success', 'Failed job queued for retry.');
    }

    /**
     * Execute data retention policy.
     */
    public function retention(Request $request)
    {
        $data = $request->validate([
            'scope' => 'required|in:failed_logins,login_history,audit_logs,error_events',
            'retention_days' => 'required|integer|min:30|max:3650',
            'confirm' => 'required|boolean'
        ]);

        $map = [
            'failed_logins' => ['security_failed_logins', 'attempted_at'],
            'login_history' => ['security_login_histories', 'login_at'],
            'audit_logs' => ['security_audit_logs', 'created_at'],
            'error_events' => ['system_error_events', 'occurred_at']
        ];

        [$table, $dateColumn] = $map[$data['scope']];

        $cutoffDate = now()->subDays($data['retention_days']);
        $count = DB::table($table)->where($dateColumn, '<', $cutoffDate)->count();

        if ($data['confirm']) {
            DB::table($table)->where($dateColumn, '<', $cutoffDate)->delete();
        }

        DB::table('data_retention_runs')->insert([
            'scope' => $data['scope'],
            'retention_days' => $data['retention_days'],
            'records_deleted' => $data['confirm'] ? $count : 0,
            'status' => $data['confirm'] ? 'completed' : 'preview',
            'details' => ($data['confirm'] ? 'Deleted ' : 'Would delete ') . $count . ' records.',
            'executed_by' => $request->user()->id,
            'executed_at' => now(),
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return back()->with('success', ($data['confirm'] ? 'Deleted ' : 'Preview: ') . $count . ' records.');
    }
}