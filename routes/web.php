<?php

use App\Http\Controllers\Admin\AcademicSessionController;
use App\Http\Controllers\Admin\AdmissionController;
use App\Http\Controllers\Admin\AdmissionInquiryController;
use App\Http\Controllers\Admin\AlumniController;
use App\Http\Controllers\Admin\AlumniEventController;
use App\Http\Controllers\Admin\ApplicantController;
use App\Http\Controllers\Admin\AssetAssignmentController;
use App\Http\Controllers\Admin\AssetController;
use App\Http\Controllers\Admin\AssetMaintenanceController;
use App\Http\Controllers\Admin\BookController;
use App\Http\Controllers\Admin\BookIssueController;
use App\Http\Controllers\Admin\BranchController;
use App\Http\Controllers\Admin\CafeteriaOrderController;
use App\Http\Controllers\Admin\CafeteriaOutletController;
use App\Http\Controllers\Admin\CampusController;
use App\Http\Controllers\Admin\CertificateTemplateController;
use App\Http\Controllers\Admin\ClassroomController;
use App\Http\Controllers\Admin\Communication\EventController;
use App\Http\Controllers\Admin\CourseController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DepartmentController;
use App\Http\Controllers\Admin\DesignationController;
use App\Http\Controllers\Admin\DisciplinaryRecordController;
use App\Http\Controllers\Admin\Exam\ExamController;
use App\Http\Controllers\Admin\Exam\ExamScheduleController;
use App\Http\Controllers\Admin\Exam\GradeController;
use App\Http\Controllers\Admin\Exam\MarksController;
use App\Http\Controllers\Admin\Exam\TabulationSheetController;
use App\Http\Controllers\Admin\ExamQuestionController;
use App\Http\Controllers\Admin\FeeGroupController;
use App\Http\Controllers\Admin\FeeTypeController;
use App\Http\Controllers\Admin\FileManagerController;
use App\Http\Controllers\Admin\FoodItemController;
use App\Http\Controllers\Admin\GeneralSettingController;
use App\Http\Controllers\Admin\GeneratedCertificateController;
use App\Http\Controllers\Admin\GuardianController;
use App\Http\Controllers\Admin\HealthRecordController;
use App\Http\Controllers\Admin\HomeworkController;
use App\Http\Controllers\Admin\HostelAllocationController;
use App\Http\Controllers\Admin\HostelRoomController;
use App\Http\Controllers\Admin\HouseController;
use App\Http\Controllers\Admin\InterviewController;
use App\Http\Controllers\Admin\InvoiceController;
use App\Http\Controllers\Admin\JobPostController;
use App\Http\Controllers\Admin\LeaveTypeController;
use App\Http\Controllers\Admin\LedgerController;
use App\Http\Controllers\Admin\LessonController;
use App\Http\Controllers\Admin\LessonPlanController;
use App\Http\Controllers\Admin\MealPaymentController;
use App\Http\Controllers\Admin\MedicalRoomController;
use App\Http\Controllers\Admin\MedicineStockController;
use App\Http\Controllers\Admin\MenuGroupController;
use App\Http\Controllers\Admin\MenuItemController;
use App\Http\Controllers\Admin\NoticeController;
use App\Http\Controllers\Admin\OfferLetterController;
use App\Http\Controllers\Admin\OnlineExamController;
use App\Http\Controllers\Admin\PaymentController;
use App\Http\Controllers\Admin\PaymentGatewayController;
use App\Http\Controllers\Admin\PaymentRefundController;
use App\Http\Controllers\Admin\PaymentTransactionController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\PhoneCallLogController;
use App\Http\Controllers\Admin\PostalRecordController;
use App\Http\Controllers\Admin\PromotionController;
use App\Http\Controllers\Admin\PurchaseItemController;
use App\Http\Controllers\Admin\PurchaseOrderController;
use App\Http\Controllers\Admin\PurchaseRequestController;
use App\Http\Controllers\Admin\QuestionBankController;
use App\Http\Controllers\Admin\QuizAttemptController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\SaleController;
use App\Http\Controllers\Admin\SchoolClassController;
use App\Http\Controllers\Admin\SectionController;
use App\Http\Controllers\Admin\SmsLogController;
use App\Http\Controllers\Admin\StaffAttendanceController;
use App\Http\Controllers\Admin\StaffController;
use App\Http\Controllers\Admin\StaffLeaveController;
use App\Http\Controllers\Admin\StaffPayrollController;
use App\Http\Controllers\Admin\StudentAttendanceController;
use App\Http\Controllers\Admin\StudentCategoryController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\Admin\StudentDocumentController;
use App\Http\Controllers\Admin\StudentFeeController;
use App\Http\Controllers\Admin\SubjectController;
use App\Http\Controllers\Admin\SupplierController;
use App\Http\Controllers\Admin\SystemRegistryController;
use App\Http\Controllers\Admin\TimeTableController;
use App\Http\Controllers\Admin\TransportAllocationController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\VaccinationController;
use App\Http\Controllers\Admin\VehicleController;
use App\Http\Controllers\Admin\VendorController;
use App\Http\Controllers\Admin\VisitLogController;
use App\Http\Controllers\Admin\VisitorController;
use App\Http\Controllers\DynamicPageController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

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
    Route::resource('lesson-plans', LessonPlanController::class);

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
    Route::get('fees/invoices', [PaymentController::class, 'feesInvoices'])->name('fees.invoices');

    Route::get('fees/ledger', [LedgerController::class, 'index'])->name('fees.ledger');
    Route::post('fees/ledger/expenses', [LedgerController::class, 'storeExpense'])->name('fees.ledger.store');
    Route::put('/fees/ledger/{id}', [LedgerController::class, 'updateExpense'])->name('fees.ledger.update');
    Route::delete('/fees/ledger/{id}', [LedgerController::class, 'destroyExpense'])->name('fees.ledger.destroy');

    Route::get('sms/logs', [SmsLogController::class, 'index'])->name('sms-logs');
    Route::post('student-attendance/send-absent-sms', [StudentAttendanceController::class, 'sendAbsentSms'])->name('attendance.send-absent-sms');

    Route::prefix('frontoffice')->name('frontoffice.')->group(function () {
        Route::resource('visitors', VisitorController::class);
        Route::resource('notices', NoticeController::class);
        Route::resource('admission-inquiries', AdmissionInquiryController::class);
        Route::resource('call-logs', PhoneCallLogController::class);
        Route::resource('postal', PostalRecordController::class);
    });
    Route::prefix('recruitment')->name('recruitment.')->group(function () {
        Route::resource('job-posts', JobPostController::class);
        Route::resource('applicants', ApplicantController::class);
        Route::patch('applicants/{applicant}/status', [ApplicantController::class, 'updateStatus'])->name('applicants.update-status');
        Route::patch('interviews/{interview}/status', [InterviewController::class, 'updateStatus'])->name('interviews.update-status');
        Route::resource('interviews', InterviewController::class);
        Route::patch('offer-letters/{offer_letter}/status', [OfferLetterController::class, 'updateStatus'])->name('offer-letters.update-status');
        Route::resource('offer-letters', OfferLetterController::class);
    });

    Route::prefix('alumni')->name('alumni.')->group(function () {
        Route::resource('directory', AlumniController::class);
        Route::patch('events/{event}/status', [AlumniEventController::class, 'updateStatus'])->name('events.update-status');
        Route::resource('events', AlumniEventController::class);
    });

    Route::resource('library/catalogue', BookController::class)->names('library.catalogue');
    Route::resource('documents/certificatetemplates', CertificateTemplateController::class)->names('documents.certificatetemplates');
    Route::resource('documents/certificates', GeneratedCertificateController::class)->names('documents.certificates');

    Route::resource('vehicles', VehicleController::class);
    Route::resource('transports', TransportAllocationController::class);
    Route::resource('hostel-rooms', HostelRoomController::class);
    Route::resource('hostel-allocations', HostelAllocationController::class);
    Route::resource('library-issues', BookIssueController::class);



    Route::prefix('purchase')->name('purchase.')->group(function () {
        Route::resource('vendors', VendorController::class);
        Route::resource('items', PurchaseItemController::class);
        Route::patch('requests/{request}/status', [PurchaseRequestController::class, 'updateStatus'])->name('requests.update-status');
        Route::resource('requests', PurchaseRequestController::class);
        Route::patch('orders/{order}/status', [PurchaseOrderController::class, 'updateStatus'])->name('orders.update-status');
        Route::resource('orders', PurchaseOrderController::class);
        Route::resource('assets', AssetController::class);
        Route::patch('suppliers/{supplier}/status', [SupplierController::class, 'updateStatus'])->name('suppliers.update-status');
        Route::resource('suppliers', SupplierController::class);
        Route::patch('asset-assignments/{asset_assignment}/status', [AssetAssignmentController::class, 'updateStatus'])->name('asset-assignments.update-status');
        Route::resource('asset-assignments', AssetAssignmentController::class);
        Route::patch('asset-maintenance/{asset_maintenance}/status', [AssetMaintenanceController::class, 'updateStatus'])->name('asset-maintenance.update-status');
        Route::resource('asset-maintenance', AssetMaintenanceController::class);
    });

    Route::post('purchase-items/sizes', [PurchaseItemController::class, 'storeSize'])->name('purchase.items.sizes.store');
    Route::delete('purchase-items/sizes/{id}', [PurchaseItemController::class, 'destroySize'])->name('purchase.items.sizes.destroy');
    Route::post('purchase-items/colors', [PurchaseItemController::class, 'storeColor'])->name('purchase.items.colors.store');
    Route::delete('purchase-items/colors/{id}', [PurchaseItemController::class, 'destroyColor'])->name('purchase.items.colors.destroy');

    Route::prefix('lms')->name('lms.')->group(function () {
        Route::resource('exams', OnlineExamController::class);
        Route::resource('questions', QuestionBankController::class);
        Route::get('exam-questions', [ExamQuestionController::class, 'index'])->name('exam-questions.index');
        Route::post('exam-questions', [ExamQuestionController::class, 'store'])->name('exam-questions.store');
        Route::delete('exam-questions/{id}', [ExamQuestionController::class, 'destroy'])->name('exam-questions.destroy');
        Route::resource('courses', CourseController::class);
        Route::resource('lessons', LessonController::class);
        Route::resource('homework', HomeworkController::class);
        Route::resource('quizattempts', QuizAttemptController::class);

    });
    Route::prefix('students')->name('students.')->group(function () {
        Route::resource('admissions', AdmissionController::class);
        Route::resource('documents', StudentDocumentController::class);
        Route::resource('discipline', DisciplinaryRecordController::class);

    });

    Route::prefix('payments')->name('payments.')->group(function () {
        Route::patch('gateways/{gateway}/status', [PaymentGatewayController::class, 'updateStatus'])->name('gateways.update-status');
        Route::resource('gateways', PaymentGatewayController::class);
        Route::patch('transactions/{transaction}/status', [PaymentTransactionController::class, 'updateStatus'])->name('transactions.update-status');
        Route::resource('transactions', PaymentTransactionController::class);
        Route::patch('refunds/{refund}/status', [PaymentRefundController::class, 'updateStatus'])->name('refunds.update-status');
        Route::resource('refunds', PaymentRefundController::class);
    });

    Route::get('sales/{sale}/invoice', [SaleController::class, 'invoice'])->name('sales.invoice'); 
    Route::resource('sales', SaleController::class);

    Route::prefix('cafeteria')->name('cafeteria.')->group(function () {
            Route::resource('outlets', CafeteriaOutletController::class);
            Route::resource('menu-items', FoodItemController::class);
            Route::resource('orders', CafeteriaOrderController::class);
            Route::resource('meal-payments', MealPaymentController::class);
        });

        Route::prefix('medical')->name('medical.')->group(function () {
            Route::resource('rooms', MedicalRoomController::class);
            Route::resource('visit-logs', VisitLogController::class);
            Route::resource('health-records', HealthRecordController::class);
            Route::resource('medicine-stock', MedicineStockController::class);
            Route::resource('vaccinations', VaccinationController::class);
        });

});




Route::middleware('auth')
    ->get('/{any}', DynamicPageController::class)
    ->where('any', '^(?!login|register|dashboard|profile|admin|logout).*$')
    ->name('dynamic.page');

require __DIR__.'/auth.php';
