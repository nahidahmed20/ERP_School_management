<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use App\Models\Student;
use App\Models\JournalEntry;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function index()
    {
        // 1. Enrollment Stats
        $totalStudents = Student::where('status', true)->count();
        $newAdmissionsThisMonth = Student::where('status', true)
            ->whereMonth('admission_date', Carbon::now()->month)
            ->whereYear('admission_date', Carbon::now()->year)
            ->count();

        // 2. Financial Analytics (Last 6 Months)
        $revenueData = [];
        $expenseData = [];
        $labels = [];

        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $labels[] = $date->format('M Y');
            
            $entries = JournalEntry::whereNull('reversed_at')->whereYear('date', $date->year)->whereMonth('date', $date->month);
            $monthlyRevenue = (float) (clone $entries)->whereHas('creditAccount', fn ($q) => $q->where('type', 'Income'))->sum('amount')
                - (float) (clone $entries)->whereHas('debitAccount', fn ($q) => $q->where('type', 'Income'))->sum('amount');
            
            $monthlyExpense = (float) (clone $entries)->whereHas('debitAccount', fn ($q) => $q->where('type', 'Expense'))->sum('amount')
                - (float) (clone $entries)->whereHas('creditAccount', fn ($q) => $q->where('type', 'Expense'))->sum('amount');
                
            $revenueData[] = $monthlyRevenue;
            $expenseData[] = $monthlyExpense;
        }

        // 3. Gender Distribution
        $genderDistribution = Student::where('status', true)
            ->select('gender', DB::raw('count(*) as count'))
            ->groupBy('gender')
            ->get();

        return Inertia::render('Admin/Analytics/Index', [
            'stats' => [
                'total_students' => $totalStudents,
                'new_admissions' => $newAdmissionsThisMonth,
            ],
            'financialChart' => [
                'labels' => $labels,
                'revenue' => $revenueData,
                'expenses' => $expenseData,
            ],
            'genderDistribution' => $genderDistribution
        ]);
    }
}
