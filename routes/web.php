<?php

use App\Http\Controllers\Admin\AcademicSessionController;
use App\Http\Controllers\Admin\BranchController;
use App\Http\Controllers\Admin\CampusController;
use App\Http\Controllers\Admin\ClassroomController;
use App\Http\Controllers\Admin\Communication\EventController;
use App\Http\Controllers\Admin\DepartmentController;
use App\Http\Controllers\Admin\DesignationController;
use App\Http\Controllers\Admin\Exam\ExamController;
use App\Http\Controllers\Admin\Exam\ExamScheduleController;
use App\Http\Controllers\Admin\Exam\GradeController;
use App\Http\Controllers\Admin\Exam\MarksController;
use App\Http\Controllers\Admin\Exam\TabulationSheetController;
use App\Http\Controllers\Admin\FeeGroupController;
use App\Http\Controllers\Admin\FeeTypeController;
use App\Http\Controllers\Admin\FileManagerController;
use App\Http\Controllers\Admin\GeneralSettingController;
use App\Http\Controllers\Admin\GuardianController;
use App\Http\Controllers\Admin\HouseController;
use App\Http\Controllers\Admin\InvoiceController;
use App\Http\Controllers\Admin\LeaveTypeController;
use App\Http\Controllers\Admin\LedgerController;
use App\Http\Controllers\Admin\MenuGroupController;
use App\Http\Controllers\Admin\MenuItemController;
use App\Http\Controllers\Admin\PaymentController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\PromotionController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\SchoolClassController;
use App\Http\Controllers\Admin\SectionController;
use App\Http\Controllers\Admin\StaffAttendanceController;
use App\Http\Controllers\Admin\StaffController;
use App\Http\Controllers\Admin\StaffLeaveController;
use App\Http\Controllers\Admin\StaffPayrollController;
use App\Http\Controllers\Admin\StudentAttendanceController;
use App\Http\Controllers\Admin\StudentCategoryController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\Admin\StudentFeeController;
use App\Http\Controllers\Admin\SubjectController;
use App\Http\Controllers\Admin\SystemRegistryController;
use App\Http\Controllers\Admin\TimeTableController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\DynamicPageController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});
Route::middleware('auth') ->prefix('admin')->name('admin.')->group(function () {
    Route::get('/menu-manager', [MenuItemController::class, 'index'])->name('menu.index');
    Route::post('/menu-manager', [MenuItemController::class, 'store'])->name('menu.store');
    Route::put('/menu-manager/{menuItem}', [MenuItemController::class, 'update'])->name('menu.update');
    Route::delete('/menu-manager/{menuItem}', [MenuItemController::class, 'destroy'])->name('menu.destroy');
    Route::get('/menu-manager/export/excel', [MenuItemController::class, 'exportExcel'])->name('menu.export.excel');
    Route::get('/menu-manager/export/pdf', [MenuItemController::class, 'exportPdf'])->name('menu.export.pdf');
    Route::get('/menu-groups', [MenuGroupController::class, 'index'])->name('menu-groups.index');
    Route::post('/menu-groups', [MenuGroupController::class, 'store'])->name('menu-groups.store');

    Route::resource('users', UserController::class);
    Route::resource('roles', RoleController::class);
    Route::resource('permissions', PermissionController::class);

    Route::post('/switch-campus', [CampusController::class, 'switchCampus'])->name('campus.switch');
    Route::resource('campuses', CampusController::class);
    Route::resource('sessions', AcademicSessionController::class);
    Route::resource('general', GeneralSettingController::class);
    Route::resource('files', FileManagerController::class);
    Route::post('files/folder', [FileManagerController::class, 'storeFolder'])->name('files.folder.store');
    Route::resource('registry', SystemRegistryController::class);
    Route::post('registry/clear', [SystemRegistryController::class, 'clear'])->name('registry.clear');

    Route::resource('departments', DepartmentController::class);
    Route::resource('designations', DesignationController::class);
    Route::resource('houses', HouseController::class);

    Route::resource('student-categories', StudentCategoryController::class);
    Route::post('classes/{id}/assign-sections', [SchoolClassController::class, 'assignSections'])->name('classes.assign-sections');
    Route::post('classes/{id}/assign-subjects', [SchoolClassController::class, 'assignSubjects'])->name('classes.assign-subjects');
    Route::resource('classes', SchoolClassController::class);
    Route::resource('sections', SectionController::class);
    Route::resource('subjects', SubjectController::class);
    Route::resource('classrooms', ClassroomController::class);
    Route::resource('time-tables', TimeTableController::class);
    Route::post('time-tables/bulk-update', [TimeTableController::class, 'bulkUpdate'])->name('time-tables.bulk-update');

    Route::resource('communication-calendars', EventController::class);
    Route::resource('exams', ExamController::class);
    Route::resource('exam-schedules', ExamScheduleController::class);
    Route::post('exams/schedule/bulk-update', [ExamScheduleController::class, 'bulkUpdate'])->name('exams.schedule.bulk-update');

    Route::resource('grades',GradeController::class);
    Route::delete('exams-marks/clear', [MarksController::class, 'destroy'])->name('exams-marks.destroy');
    Route::resource('exams-marks',MarksController::class);
    Route::get('exams/report/cards', [MarksController::class, 'examsReportcards'])->name('exams.reportcards');
    Route::get('exams/tabulation/sheet', [TabulationSheetController::class, 'index'])->name('exams.tabulation');

    Route::get('students/search-guardian', [StudentController::class, 'searchGuardian'])->name('students.search_guardian');
    Route::get('students/parents', [GuardianController::class, 'index'])->name('students.parents');
    Route::get('students/promotions', [PromotionController::class, 'index'])->name('students.promotions');
    Route::post('students/promotions', [PromotionController::class, 'store'])->name('students.promotions.store');

    Route::get('students/admissions', [StudentController::class, 'admissions'])->name('students.admissions');
    Route::get('students/documents', [StudentController::class, 'documents'])->name('students.documents');
    Route::get('students/discipline', [StudentController::class, 'discipline'])->name('students.discipline');

    Route::resource('students', StudentController::class);
    Route::resource('student-attendance', StudentAttendanceController::class);

    Route::resource('leave-types',LeaveTypeController::class);
    Route::resource('staff', StaffController::class);
    Route::get('staff-attendance', [StaffAttendanceController::class, 'index'])->name('staff-attendance.index');
    Route::post('staff-attendance', [StaffAttendanceController::class, 'store'])->name('staff-attendance.store');
    Route::resource('staff-leaves', StaffLeaveController::class);
    Route::resource('staff-payrolls', StaffPayrollController::class);

    Route::get('/attendance-report', [ReportController::class, 'staffAttendanceReport'])->name('attendance-report.index');
    Route::post('/attendance-report', [ReportController::class, 'generate'])->name('attendance-report.generate');
    Route::get('fee-collection', [ReportController::class, 'feeCollection'])->name('reports.fees');
    Route::get('due-fees', [ReportController::class, 'dueFees'])->name('due_fees');
    Route::get('student/attendance/report', [ReportController::class, 'studentReport'])->name('student_attendance.report');

    Route::resource('fees-groups', FeeGroupController::class);
    Route::get('fees-groups/{feeGroup}/fees-types', [FeeTypeController::class, 'index'])->name('fees-types.index');
    Route::post('fees-groups/{feeGroup}/fees-types', [FeeTypeController::class, 'store'])->name('fees-types.store');
    Route::put('fees-types/{feeType}', [FeeTypeController::class, 'update'])->name('fees-types.update');
    Route::delete('fees-types/{feeType}', [FeeTypeController::class, 'destroy'])->name('fees-types.destroy');

    Route::resource('studentfees', StudentFeeController::class);
    Route::get('fees/payments', [PaymentController::class, 'index'])->name('fees.payments');
    Route::post('fees/payments', [PaymentController::class, 'store'])->name('fees.payments.store');
    Route::get('fees/invoices', [InvoiceController::class, 'index'])->name('fees.invoices');

    Route::get('fees/ledger', [LedgerController::class, 'index'])->name('fees.ledger');
    Route::post('fees/ledger/expenses', [LedgerController::class, 'storeExpense'])->name('fees.ledger.store');
    Route::put('/fees/ledger/{id}', [LedgerController::class, 'updateExpense'])->name('fees.ledger.update');
    Route::delete('/fees/ledger/{id}', [LedgerController::class, 'destroyExpense'])->name('fees.ledger.destroy');
});




Route::middleware('auth')
    ->get('/{any}', DynamicPageController::class)
    ->where('any', '^(?!login|register|dashboard|profile|admin|logout).*$')
    ->name('dynamic.page');

require __DIR__.'/auth.php';
