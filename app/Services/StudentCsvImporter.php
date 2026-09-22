<?php

namespace App\Services;

use App\Models\Campus;
use App\Models\Enrollment;
use App\Models\Guardian;
use App\Models\SaasTenant;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class StudentCsvImporter
{
    public const MAX_ROWS = 500;

    public const HEADERS = [
        'admission_no', 'first_name', 'last_name', 'gender', 'date_of_birth', 'admission_date',
        'academic_session_id', 'class_id', 'section_id', 'roll_no', 'email', 'nationality',
        'present_address', 'permanent_address', 'guardian_id', 'father_name', 'father_phone',
        'mother_name', 'mother_phone', 'guardian_email',
    ];

    private const REQUIRED_HEADERS = [
        'first_name', 'gender', 'date_of_birth', 'admission_date', 'academic_session_id',
        'class_id', 'section_id', 'nationality', 'present_address', 'permanent_address',
    ];

    public function import(UploadedFile $file, int $campusId, User $actor): int
    {
        $rows = $this->read($file);
        $this->validateRows($rows, $campusId);
        $this->assertCapacity($actor, $campusId, count($rows));

        return DB::transaction(function () use ($rows, $campusId, $actor) {
            // Serialize imports for the same campus and recheck conflicts that
            // may have appeared between file validation and the transaction.
            Campus::whereKey($campusId)->lockForUpdate()->firstOrFail();
            $this->assertCapacity($actor, $campusId, count($rows), lock: true);
            $this->validateRows($rows, $campusId);

            foreach ($rows as $row) {
                $guardian = $row['guardian_id']
                    ? Guardian::where('campus_id', $campusId)->findOrFail($row['guardian_id'])
                    : Guardian::firstOrCreate([
                        'campus_id' => $campusId, 'father_phone' => $row['father_phone'],
                    ], [
                        'father_name' => $row['father_name'], 'mother_name' => $row['mother_name'],
                        'mother_phone' => $row['mother_phone'], 'guardian_email' => $row['guardian_email'],
                        'address' => $row['present_address'],
                    ]);

                $student = Student::create([
                    'campus_id' => $campusId, 'guardian_id' => $guardian->id,
                    'admission_no' => $row['admission_no'] ?: 'STU-'.now()->format('Y').'-'.Str::upper(Str::random(12)),
                    'first_name' => $row['first_name'], 'last_name' => $row['last_name'],
                    'gender' => $row['gender'], 'date_of_birth' => $row['date_of_birth'],
                    'admission_date' => $row['admission_date'], 'email' => $row['email'],
                    'nationality' => $row['nationality'], 'present_address' => $row['present_address'],
                    'permanent_address' => $row['permanent_address'], 'status' => true,
                ]);
                $student->guardians()->attach($guardian->id, [
                    'relationship' => 'primary guardian', 'is_primary' => true, 'can_pickup' => true,
                    'receives_sms' => true, 'receives_email' => true,
                ]);
                Enrollment::create([
                    'campus_id' => $campusId, 'student_id' => $student->id,
                    'academic_session_id' => $row['academic_session_id'], 'class_id' => $row['class_id'],
                    'section_id' => $row['section_id'], 'roll_no' => $row['roll_no'], 'is_current' => true,
                ]);
            }

            return count($rows);
        });
    }

    private function assertCapacity(User $actor, int $campusId, int $incomingCount, bool $lock = false): void
    {
        // Keep the existing subscription policy's Super Admin exemption.
        if ($actor->hasRole('Super Admin')) {
            return;
        }

        $tenantId = Campus::whereKey($campusId)->value('saas_tenant_id');
        if (! $tenantId) {
            return;
        }
        $query = SaasTenant::with('plan')->whereKey($tenantId);
        $tenant = ($lock ? $query->lockForUpdate() : $query)->first();
        if ($tenant && ! app(TenantStudentCapacity::class)->allows($tenant, $incomingCount)) {
            throw ValidationException::withMessages(['file' => 'This file exceeds the tenant student limit. Reduce the batch size or update the subscription before importing.']);
        }
    }

    private function read(UploadedFile $file): array
    {
        $handle = fopen($file->getRealPath(), 'rb');
        if ($handle === false) {
            throw ValidationException::withMessages(['file' => 'The CSV file could not be read.']);
        }

        try {
            $headers = fgetcsv($handle, 0, ',', '"', '');
            if (! $headers) {
                throw ValidationException::withMessages(['file' => 'The CSV file is empty.']);
            }
            $headers[0] = preg_replace('/^\xEF\xBB\xBF/', '', (string) $headers[0]);
            $headers = array_map(fn ($value) => strtolower(trim((string) $value)), $headers);
            $missing = array_diff(self::REQUIRED_HEADERS, $headers);
            $unknown = array_diff($headers, self::HEADERS);
            if ($missing || $unknown || count(array_unique($headers)) !== count($headers)) {
                throw ValidationException::withMessages(['file' => 'Use the template headers. Missing: '
                    .implode(', ', $missing).'. Unknown or repeated columns: '.implode(', ', $unknown).'.']);
            }

            $rows = [];
            $rowNumber = 1;
            while (($values = fgetcsv($handle, 0, ',', '"', '')) !== false) {
                $rowNumber++;
                if (count($values) === 1 && trim((string) $values[0]) === '') {
                    continue;
                }
                if (count($rows) >= self::MAX_ROWS) {
                    throw ValidationException::withMessages(['file' => 'Import at most '.self::MAX_ROWS.' students per file.']);
                }
                if (count($values) !== count($headers)) {
                    throw ValidationException::withMessages(['file' => "Row {$rowNumber}: column count does not match the header."]);
                }
                foreach ($values as $value) {
                    if (! mb_check_encoding((string) $value, 'UTF-8') || str_contains((string) $value, "\0")) {
                        throw ValidationException::withMessages(['file' => "Row {$rowNumber}: save the file as UTF-8 CSV."]);
                    }
                }
                $values = array_map(fn ($value) => trim((string) $value) === '' ? null : trim((string) $value), $values);
                $rows[] = array_merge(array_fill_keys(self::HEADERS, null), array_combine($headers, $values), ['_row' => $rowNumber]);
            }
            if (! $rows) {
                throw ValidationException::withMessages(['file' => 'Add at least one student below the CSV header.']);
            }

            return $rows;
        } finally {
            fclose($handle);
        }
    }

    private function validateRows(array $rows, int $campusId): void
    {
        $exists = fn (string $table) => Rule::exists($table, 'id')->where('campus_id', $campusId);
        $errors = [];
        $seen = ['email' => [], 'admission_no' => [], 'roll_no' => []];

        foreach ($rows as $row) {
            $line = $row['_row'];
            $validator = Validator::make($row, [
                'admission_no' => ['nullable', 'string', 'max:100', Rule::unique('students', 'admission_no')],
                'first_name' => 'required|string|max:255', 'last_name' => 'nullable|string|max:255',
                'gender' => 'required|in:male,female,other', 'date_of_birth' => 'required|date_format:Y-m-d|before:today',
                'admission_date' => 'required|date_format:Y-m-d|after:date_of_birth',
                'academic_session_id' => ['required', 'integer', $exists('academic_sessions')->where('is_active', true)],
                'class_id' => ['required', 'integer', $exists('school_classes')->where('is_active', true)],
                'section_id' => ['required', 'integer', $exists('sections')->where('is_active', true)],
                'roll_no' => 'nullable|string|max:50', 'email' => 'nullable|email|max:255',
                'nationality' => 'required|string|max:100', 'present_address' => 'required|string|max:5000',
                'permanent_address' => 'required|string|max:5000',
                'guardian_id' => ['nullable', 'integer', $exists('guardians')],
                'father_name' => 'required_without:guardian_id|nullable|string|max:255',
                'father_phone' => 'required_without:guardian_id|nullable|string|max:20',
                'mother_name' => 'required_without:guardian_id|nullable|string|max:255',
                'mother_phone' => 'nullable|string|max:20', 'guardian_email' => 'nullable|email|max:255',
            ]);
            foreach ($validator->errors()->messages() as $field => $messages) {
                $errors["rows.{$line}.{$field}"] = "Row {$line}: ".implode(' ', $messages);
            }
            if ($validator->fails()) {
                continue;
            }

            if (! DB::table('class_section')->where('class_id', $row['class_id'])->where('section_id', $row['section_id'])->exists()) {
                $errors["rows.{$line}.section_id"] = "Row {$line}: the section is not assigned to this class.";
            }

            foreach (['email', 'admission_no', 'roll_no'] as $field) {
                if (! $row[$field]) {
                    continue;
                }
                $key = mb_strtolower($row[$field]);
                if ($field === 'roll_no') {
                    $key = implode(':', [$row['academic_session_id'], $row['class_id'], $row['section_id'], $key]);
                }
                if (isset($seen[$field][$key])) {
                    $errors["rows.{$line}.{$field}"] = "Row {$line}: {$field} duplicates row ".$seen[$field][$key].'.';
                }
                $seen[$field][$key] = $line;
            }
            if ($row['email'] && (DB::table('students')->whereRaw('LOWER(email) = ?', [mb_strtolower($row['email'])])->exists()
                || DB::table('users')->whereRaw('LOWER(email) = ?', [mb_strtolower($row['email'])])->exists())) {
                $errors["rows.{$line}.email"] = "Row {$line}: email is already used by a student or account.";
            }
            if ($row['roll_no'] && DB::table('enrollments')->where('campus_id', $campusId)
                ->where('academic_session_id', $row['academic_session_id'])->where('class_id', $row['class_id'])
                ->where('section_id', $row['section_id'])->where('roll_no', $row['roll_no'])->exists()) {
                $errors["rows.{$line}.roll_no"] = "Row {$line}: roll number is already used in this session, class and section.";
            }
        }

        if ($errors) {
            throw ValidationException::withMessages($errors);
        }
    }
}
