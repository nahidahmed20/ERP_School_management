<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\{CustomReportService, MalwareScanner};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{DB, Storage};
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use App\Models\CustomReport;
use App\Models\ScheduledReport;
use App\Models\ReportExport;
use App\Models\ImportBatch;
use App\Models\KpiTarget;
use App\Models\AdministrationActivity;
use App\Models\CommunicationNotification;
use App\Models\WorkflowApproval; // assuming it exists

class ReportingAdministrationController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/ReportingAdministration/Index', [
            'sources' => CustomReportService::SOURCES,
            'reports' => CustomReport::latest()->get(),
            'schedules' => ScheduledReport::latest()->get(),
            'exports' => ReportExport::latest('exported_at')->take(100)->get(),
            'imports' => ImportBatch::latest()->take(100)->get(),
            'approvals' => DB::table('workflow_approvals')->where('status', 'Pending')->latest()->take(100)->get(),
            'notifications' => CommunicationNotification::latest()->take(100)->get(),
            'kpis' => KpiTarget::latest()->get(),
            'activities' => AdministrationActivity::with('user:id,name')->latest('occurred_at')->take(150)->get()->map(function ($activity) {
                $activity->user_name = $activity->user ? $activity->user->name : null;
                return $activity;
            }),
            'campusComparison' => $this->campusComparison()
        ]);
    }

    public function report(Request $r)
    {
        $d = $r->validate([
            'name' => 'required|string|max:255',
            'data_source' => 'required|in:' . implode(',', array_keys(CustomReportService::SOURCES)),
            'columns' => 'required|array|min:1',
            'columns.*' => 'string',
            'filter_column' => 'nullable|string',
            'filter_operator' => 'nullable|in:=,!=,>,>=,<,<=,like',
            'filter_value' => 'nullable'
        ]);

        $allowed = CustomReportService::SOURCES[$d['data_source']]['columns'];
        if (array_diff($d['columns'], $allowed)) {
            throw ValidationException::withMessages(['columns' => 'One or more columns are not allowed.']);
        }

        $filters = $d['filter_column'] ? [['column' => $d['filter_column'], 'operator' => $d['filter_operator'] ?: '=', 'value' => $d['filter_value']]] : [];
        
        $report = CustomReport::create([
            'name' => $d['name'],
            'data_source' => $d['data_source'],
            'columns' => $d['columns'], // array cast will handle json
            'filters' => $filters, // array cast will handle json
            'status' => 'active',
            'created_by' => $r->user()->id,
        ]);

        $this->activity($r, 'report_created', 'custom_report', $report->id, "Created report {$d['name']}");
        return back()->with('success', 'Custom report saved.');
    }

    public function preview(int $report, CustomReportService $s)
    {
        $r = CustomReport::findOrFail($report);
        return response()->json(['rows' => $s->rows($r)->take(100)->values()]);
    }

    public function export(Request $r, int $report, CustomReportService $s)
    {
        $definition = CustomReport::findOrFail($report);

        Storage::disk('local')->makeDirectory('reports/exports');
        $path = 'reports/exports/' . $report . '-' . now()->format('YmdHis') . '.csv';
        $fullPath = Storage::disk('local')->path($path);

        $query = $s->buildQuery($definition);
        $handle = fopen($fullPath, 'w');
        $rowCount = 0;
        $isFirstRow = true;

        foreach ($query->cursor() as $row) {
            $rowArray = (array) $row;
            if ($isFirstRow) {
                fputcsv($handle, array_keys($rowArray)); // Header
                $isFirstRow = false;
            }
            fputcsv($handle, $rowArray);
            $rowCount++;
        }

        if ($rowCount === 0) {
            fputcsv($handle, ['No data found']);
        }
        fclose($handle);

        $oldExports = ReportExport::where('custom_report_id', $report)->where('exported_at', '<', now()->subDays(7))->get();
        foreach ($oldExports as $old) {
            Storage::disk('local')->delete($old->file_path);
            $old->delete();
        }

        $exportRecord = ReportExport::create([
            'custom_report_id' => $report,
            'format' => 'csv',
            'file_path' => $path,
            'row_count' => $rowCount,
            'status' => 'completed',
            'exported_by' => $r->user()->id,
            'exported_at' => now(),
        ]);

        $this->activity($r, 'report_exported', 'report_export', $exportRecord->id, "Exported {$definition->name} ({$rowCount} rows)");
        
        return response()->download($fullPath, $definition->name . '.csv');
    }

    public function download(Request $r, int $export)
    {
        $x = ReportExport::findOrFail($export);
        abort_unless(Storage::disk('local')->exists($x->file_path), 404);
        
        return response()->download(Storage::disk('local')->path($x->file_path));
    }

    public function schedule(Request $r)
    {
        $d = $r->validate([
            'custom_report_id' => 'required|exists:custom_reports,id',
            'frequency' => 'required|in:daily,weekly,monthly',
            'recipients' => 'required|string',
            'format' => 'required|in:csv',
            'next_run_at' => 'required|date'
        ]);

        $schedule = ScheduledReport::create($d + ['delivery_channel' => 'email', 'is_active' => true]);
        $this->activity($r, 'report_scheduled', 'scheduled_report', $schedule->id, 'Scheduled report delivery');
        
        return back()->with('success', 'Report delivery scheduled.');
    }

    public function import(Request $r, MalwareScanner $scanner)
    {
        $d = $r->validate([
            'entity_type' => 'required|in:expenses',
            'file' => 'required|file|mimes:csv,txt|max:5120'
        ]);

        $scanner->assertClean($r->file('file'));
        $handle = fopen($r->file('file')->getRealPath(), 'r');
        $headers = array_map(fn($x) => strtolower(trim($x)), fgetcsv($handle) ?: []);
        
        $errors = [];
        $valid = [];
        $line = 1;

        while (($row = fgetcsv($handle)) !== false) {
            $line++;
            $data = array_combine($headers, array_pad($row, count($headers), null));
            
            if (!$data || !$data['expense_head'] || !is_numeric($data['amount']) || !strtotime($data['expense_date'])) {
                $errors[] = "Row {$line}: expense_head, numeric amount and valid expense_date are required.";
                continue;
            }
            $valid[] = $data;
        }
        fclose($handle);

        $batch = ImportBatch::create([
            'entity_type' => $d['entity_type'],
            'file_name' => $r->file('file')->getClientOriginalName(),
            'status' => $errors ? 'validated_with_errors' : 'validated',
            'total_rows' => count($valid) + count($errors),
            'valid_rows' => count($valid),
            'invalid_rows' => count($errors),
            'errors' => $errors, // cast to json array
            'created_ids' => [], // cast to json array
            'imported_by' => $r->user()->id,
        ]);

        if ($errors) {
            return back()->with('warning', 'Validation completed with errors; nothing imported.');
        }

        $ids = [];
        DB::transaction(function () use ($valid, &$ids) {
            foreach ($valid as $x) {
                $ids[] = DB::table('expenses')->insertGetId([
                    'expense_head' => $x['expense_head'],
                    'amount' => $x['amount'],
                    'expense_date' => date('Y-m-d', strtotime($x['expense_date'])),
                    'description' => $x['description'] ?? null,
                    'recorded_by' => 'Bulk import',
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
        });

        $batch->update([
            'status' => 'completed',
            'created_ids' => $ids, // array cast
        ]);

        $this->activity($r, 'bulk_import', 'import_batch', $batch->id, 'Imported ' . count($ids) . ' expense records');
        return back()->with('success', count($ids) . ' records imported.');
    }

    public function rollback(Request $r, int $batch)
    {
        $b = ImportBatch::lockForUpdate()->findOrFail($batch);
        abort_unless($b->status === 'completed' && !$b->rolled_back_at, 422, 'Batch cannot be rolled back.');
        
        $ids = is_array($b->created_ids) ? $b->created_ids : (json_decode($b->created_ids, true) ?: []);
        
        DB::transaction(function () use ($b, $ids) {
            if ($b->entity_type === 'expenses') {
                DB::table('expenses')->whereIn('id', $ids)->delete();
            }
            $b->update([
                'status' => 'rolled_back',
                'rolled_back_at' => now(),
            ]);
        });

        $this->activity($r, 'import_rollback', 'import_batch', $batch, 'Rolled back imported records');
        return back()->with('success', 'Import rolled back.');
    }

    public function kpi(Request $r)
    {
        $d = $r->validate([
            'name' => 'required|string|max:255',
            'metric' => 'required|in:student_count,fee_collection,attendance_rate,expense_total',
            'target_value' => 'required|numeric|min:0',
            'period' => 'required|in:monthly,quarterly,annual',
            'starts_at' => 'required|date',
            'ends_at' => 'required|date|after_or_equal:starts_at',
            'owner_id' => 'nullable|exists:users,id'
        ]);

        $kpi = KpiTarget::create($d + [
            'status' => 'active',
        ]);

        $this->activity($r, 'kpi_created', 'kpi_target', $kpi->id, "Created KPI {$d['name']}");
        return back()->with('success', 'KPI target saved.');
    }

    private function campusComparison()
    {
        return DB::table('campuses')->where('is_active', true)->get()->map(function ($c) {
            return [
                'id' => $c->id,
                'name' => $c->name,
                'students' => DB::table('students')->where('campus_id', $c->id)->whereNull('deleted_at')->count(),
                'staff' => DB::table('staff')->where('campus_id', $c->id)->whereNull('deleted_at')->count(),
                'collections' => (float) DB::table('invoices')->where('campus_id', $c->id)->sum('paid_amount'),
                'outstanding' => (float) DB::table('invoices')->where('campus_id', $c->id)->whereIn('status', ['Unpaid', 'Partial'])->selectRaw('COALESCE(SUM(GREATEST(amount+fine-discount-paid_amount,0)),0) total')->value('total')
            ];
        });
    }

    private function activity($r, $type, $subject, $id, $description)
    {
        AdministrationActivity::create([
            'user_id' => $r->user()->id,
            'type' => $type,
            'subject_type' => $subject,
            'subject_id' => $id,
            'description' => $description,
            'metadata' => ['ip' => $r->ip()],
            'occurred_at' => now(),
        ]);
    }
}