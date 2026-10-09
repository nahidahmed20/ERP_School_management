<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use App\Models\Student;
use App\Models\Payment;
use App\Models\Expense;
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
            
            $monthlyRevenue = DB::table('payments')
                ->where('campus_id', config('app.active_campus_id'))
                ->whereMonth('payment_date', $date->month)
                ->whereYear('payment_date', $date->year)
                ->sum('amount_paid');
            
            $monthlyExpense = DB::table('expenses')
                ->where('campus_id', config('app.active_campus_id'))
                ->whereMonth('expense_date', $date->month)
                ->whereYear('expense_date', $date->year)
                ->sum('amount');
                
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
