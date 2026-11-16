<?php

namespace App\Services;

use App\Models\SaasBackup;
use App\Models\Campus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use ZipArchive;
use Exception;

class SecureBackupService
{
    /**
     * Create a secure JSON-based backup and encrypt it.
     */
    public function create(SaasBackup $backup, ?array $campusIds = null): SaasBackup
    {
        $disk = config('erp.backup_disk', 'backup');
        $path = 'backups/'.$backup->file_name;
        $password = (string) config('app.key');
        $type = strtolower($backup->type);
        $includeDatabase = str_contains($type, 'database') || str_contains($type, 'full');
        $includeFiles = str_contains($type, 'files') || str_contains($type, 'full');
        if ($password === '') {
            throw new Exception('APP_KEY is empty. Cannot encrypt backup.');
        }
        if (! $includeDatabase && ! $includeFiles) {
            throw new Exception('Unsupported backup type.');
        }
        if (! $backup->file_name || preg_match('/[\\\\\/\x00]/', $backup->file_name) || str_contains($backup->file_name, '..')) {
            throw new Exception('Backup filename must not contain a directory path.');
        }
        if (Storage::disk($disk)->exists($path)) {
            throw new Exception('A backup with this filename already exists. Choose a new filename.');
        }

        if ($backup->saas_tenant_id) {
            $tenantCampuses = Campus::where('saas_tenant_id', $backup->saas_tenant_id)->pluck('id')->all();
            $campusIds ??= $tenantCampuses;
            if (array_diff($campusIds, $tenantCampuses)) {
                throw new Exception('Backup campuses must belong to the selected tenant.');
            }
        }
        if ($campusIds !== null) {
            $campusIds = array_values(array_unique(array_map('intval', $campusIds)));
            if (! $campusIds || min($campusIds) < 1 || Campus::whereIn('id', $campusIds)->count() !== count($campusIds)) {
                throw new Exception('Select at least one existing campus for a campus-scoped backup.');
            }
            if ($includeFiles) {
                throw new Exception('Campus-scoped file backups are not supported. Choose a Database backup for a tenant.');
            }
        }

        $backup->update(['status' => 'Processing', 'error_message' => null]);
        $fullPath = tempnam(sys_get_temp_dir(), 'erp_backup_');
        if ($fullPath === false) {
            throw new Exception('Could not create a temporary backup archive.');
        }
        $zip = new ZipArchive();
        $opened = false;
        try {
            if ($zip->open($fullPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
                throw new Exception('Could not create ZIP archive.');
            }
            $opened = true;
            if (! $zip->setPassword($password)) {
                throw new Exception('Could not set backup encryption password.');
            }
            $metadata = ['driver' => DB::getDriverName(), 'created_at' => now()->toIso8601String(),
                'tenant_scoped' => $campusIds !== null, 'campus_ids' => $campusIds, 'files_included' => $includeFiles];
            $this->addEncryptedJson($zip, 'manifest.json', $metadata);

            if ($includeDatabase) {
                $payload = $metadata + ['tables' => []];
                foreach (Schema::getTableListing(schemaQualified: false) as $table) {
                    if (in_array($table, ['migrations', 'sessions', 'jobs', 'failed_jobs'], true)) {
                        continue;
                    }
                    $query = DB::table($table);
                    if ($campusIds !== null) {
                        if ($table === 'campuses') {
                            $query->whereIn('id', $campusIds);
                        } elseif (Schema::hasColumn($table, 'campus_id')) {
                            $query->whereIn('campus_id', $campusIds);
                        } else {
                            // Global settings, API credentials and tenant-wide
                            // tables are not included in campus database exports.
                            continue;
                        }
                    }
                    $payload['tables'][$table] = $query->get()->map(fn ($row) => (array) $row)->all();
                }
                $this->addEncryptedJson($zip, 'database.json', $payload);
            }

            if ($includeFiles) {
                foreach (['private' => 'local', 'public' => 'public'] as $label => $sourceDisk) {
                    $source = Storage::disk($sourceDisk);
                    foreach ($source->allFiles() as $file) {
                        $normalized = str_replace('\\', '/', $file);
                        if (str_contains('/'.$normalized, '/backups/') || is_link($source->path($file))) {
                            continue;
                        }
                        $entry = 'files/'.$label.'/'.$normalized;
                        if (! $zip->addFile($source->path($file), $entry) || ! $zip->setEncryptionName($entry, ZipArchive::EM_AES_256)) {
                            throw new Exception('Could not add an encrypted file to the backup.');
                        }
                    }
                }
            }
            $closed = $zip->close();
            $opened = false;
            if (! $closed) {
                throw new Exception('Could not finish backup archive.');
            }

            $checksum = hash_file('sha256', $fullPath);
            $stream = fopen($fullPath, 'rb');
            if ($stream === false) {
                throw new Exception('Could not read the backup archive.');
            }
            try {
                if (! Storage::disk($disk)->put($path, $stream)) {
                    throw new Exception('Could not save the backup archive.');
                }
            } finally {
                fclose($stream);
            }
            $backup->update([
                'disk' => $disk, 'path' => $path, 'status' => 'Completed', 'checksum' => $checksum,
                'encrypted' => true, 'file_size' => round(filesize($fullPath) / 1048576, 2).' MB',
                'completed_at' => now(), 'error_message' => null,
            ]);

            return $backup;
        } finally {
            if ($opened) {
                $zip->close();
            }
            if (is_file($fullPath)) {
                unlink($fullPath);
            }
        }
    }

    private function addEncryptedJson(ZipArchive $zip, string $name, array $payload): void
    {
        if (! $zip->addFromString($name, json_encode($payload, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE))
            || ! $zip->setEncryptionName($name, ZipArchive::EM_AES_256)) {
            throw new Exception('Could not encrypt backup metadata.');
        }
    }

    /**
     * Verify the backup archive integrity.
     */
    public function verify(SaasBackup $backup): bool
    {
        if (!$backup->disk || !$backup->path || !Storage::disk($backup->disk)->exists($backup->path)) {
            return false;
        }
        
        $stream = Storage::disk($backup->disk)->readStream($backup->path);
        if ($stream === false) {
            return false;
        }
        try {
            $hash = hash_init('sha256');
            hash_update_stream($hash, $stream);
            $currentChecksum = hash_final($hash);
        } finally {
            fclose($stream);
        }
        
        $verified = is_string($currentChecksum) && hash_equals((string) $backup->checksum, $currentChecksum);
        if ($verified) {
            $backup->update(['verified_at' => now()]);
        }

        return $verified;
    }
}
