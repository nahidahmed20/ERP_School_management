<?php

use App\Http\Controllers\Admin\AcademicSessionController;
use App\Http\Controllers\Admin\AcademicOperationsController;
use App\Http\Controllers\Admin\AttendanceOperationsController;
use App\Http\Controllers\Admin\AccountingChartController;
use App\Http\Controllers\Admin\AccountingVoucherController;
use App\Http\Controllers\Admin\AdmissionController;
use App\Http\Controllers\Admin\AdmissionInquiryController;
use App\Http\Controllers\Admin\AlumniController;
use App\Http\Controllers\Admin\AlumniEventController;
use App\Http\Controllers\Admin\ApplicantController;
use App\Http\Controllers\Admin\ApprovalWorkflowController;
use App\Http\Controllers\Admin\AssetAssignmentController;
use App\Http\Controllers\Admin\AssetController;
use App\Http\Controllers\Admin\AssetMaintenanceController;
use App\Http\Controllers\Admin\BiometricDeviceController;
use App\Http\Controllers\Admin\BiometricEnrolledUserController;
use App\Http\Controllers\Admin\BiometricSyncLogController;
use App\Http\Controllers\Admin\BookController;
use App\Http\Controllers\Admin\BookIssueController;
use App\Http\Controllers\Admin\LibraryOperationsController;
use App\Http\Controllers\Admin\CafeteriaOrderController;
use App\Http\Controllers\Admin\CafeteriaOperationsController;
use App\Http\Controllers\Admin\CafeteriaOutletController;
use App\Http\Controllers\Admin\CampusController;
use App\Http\Controllers\Admin\CertificateTemplateController;
use App\Http\Controllers\Admin\ClassroomController;
use App\Http\Controllers\Admin\Communication\EventController;
use App\Http\Controllers\Admin\CommunicationChatController;
use App\Http\Controllers\Admin\CommunicationCmsController;
use App\Http\Controllers\Admin\CommunicationNotificationController;
use App\Http\Controllers\Admin\CourseController;
use App\Http\Controllers\Admin\CustomFieldController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DepartmentController;
use App\Http\Controllers\Admin\DesignationController;
use App\Http\Controllers\Admin\DisciplinaryRecordController;
use App\Http\Controllers\Admin\EmailLogController;
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
use App\Http\Controllers\Admin\FormBuilderController;
use App\Http\Controllers\Admin\GeneralSettingController;
use App\Http\Controllers\Admin\GeneratedCertificateController;
use App\Http\Controllers\Admin\GuardianController;
use App\Http\Controllers\Admin\HealthRecordController;
use App\Http\Controllers\Admin\HelpdeskTicketController;
use App\Http\Controllers\Admin\HomeworkController;
use App\Http\Controllers\Admin\HostelAllocationController;
use App\Http\Controllers\Admin\HostelFeeController;
use App\Http\Controllers\Admin\HostelOperationsController;
use App\Http\Controllers\Admin\HostelRoomController;
use App\Http\Controllers\Admin\HouseController;
use App\Http\Controllers\Admin\IdCardTemplateController;
use App\Http\Controllers\Admin\InterviewController;
use App\Http\Controllers\Admin\JobPostController;
use App\Http\Controllers\Admin\LeaveTypeController;
use App\Http\Controllers\Admin\LedgerController;
use App\Http\Controllers\Admin\LessonController;
use App\Http\Controllers\Admin\LessonPlanController;
use App\Http\Controllers\Admin\MealPaymentController;
use App\Http\Controllers\Admin\MedicalRoomController;
use App\Http\Controllers\Admin\MedicalOperationsController;
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
use App\Http\Controllers\Admin\QuestionPaperController;
use App\Http\Controllers\Admin\OfficialDocumentController;
use App\Http\Controllers\Admin\OfficialDocumentTemplateController;
use App\Http\Controllers\Admin\QuizAttemptController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\ReportingAdministrationController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\SaasAiAssistantController;
use App\Http\Controllers\Admin\SaasApiKeyController;
use App\Http\Controllers\Admin\SaasBackupController;
use App\Http\Controllers\Admin\SaasPlanController;
use App\Http\Controllers\Admin\SaasQueueMonitorController;
use App\Http\Controllers\Admin\SaasScheduledTaskController;
use App\Http\Controllers\Admin\SaasTenantController;
use App\Http\Controllers\Admin\SaasControlController;
use App\Http\Controllers\Admin\SaleController;
use App\Http\Controllers\Admin\SchoolClassController;
use App\Http\Controllers\Admin\SectionController;
use App\Http\Controllers\Admin\SecurityAuditLogController;
use App\Http\Controllers\Admin\SecurityOperationsController;
use App\Http\Controllers\Admin\SecurityFailedLoginController;
use App\Http\Controllers\Admin\SecurityLoginController;
use App\Http\Controllers\Admin\SecurityTrustedDeviceController;
use App\Http\Controllers\Admin\SecureFileController;
use App\Http\Controllers\Admin\SmsLogController;
use App\Http\Controllers\Admin\StaffAppraisalController;
use App\Http\Controllers\Admin\StaffAttendanceController;
use App\Http\Controllers\Admin\StaffController;
use App\Http\Controllers\Admin\StaffLeaveController;
use App\Http\Controllers\Admin\StaffLoanController;
use App\Http\Controllers\Admin\StaffPayrollController;
use App\Http\Controllers\Admin\StaffHrRecordController;
use App\Http\Controllers\Admin\StudentAttendanceController;
use App\Http\Controllers\Admin\StudentDevelopmentRecordController;
use App\Http\Controllers\Admin\StudentCategoryController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\Admin\StudentGuardianOperationsController;
use App\Http\Controllers\Admin\StudentDocumentController;
use App\Http\Controllers\Admin\StudentFeeController;
use App\Http\Controllers\Admin\StudentServiceReviewController;
use App\Http\Controllers\Admin\StudyMaterialController;
use App\Http\Controllers\Admin\SubjectController;
use App\Http\Controllers\Admin\SupplierController;
use App\Http\Controllers\Admin\SystemRegistryController;
use App\Http\Controllers\Admin\TimeTableController;
use App\Http\Controllers\Admin\TranscriptTemplateController;
use App\Http\Controllers\Admin\TransportAllocationController;
use App\Http\Controllers\Admin\TransportOperationsController;
use App\Http\Controllers\Admin\TransportRouteController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\VaccinationController;
use App\Http\Controllers\Admin\VehicleController;
use App\Http\Controllers\Admin\VendorController;
use App\Http\Controllers\Admin\VisitLogController;
use App\Http\Controllers\Admin\VisitorController;
use App\Http\Controllers\DynamicPageController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicInquiryController;
use App\Http\Controllers\StudentPortalController;
use App\Http\Controllers\SslCommerzPaymentController;
use App\Http\Controllers\PortalServiceController;
use App\Http\Controllers\GuardianPortalController;
use App\Http\Controllers\CommunicationWebhookController;
use App\Http\Controllers\Admin\CommunicationCenterController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [\App\Http\Controllers\PublicSiteController::class,'home'])->name('home');
Route::get('/campuses', [\App\Http\Controllers\PublicSiteController::class,'campuses'])->name('site.campuses');
Route::get('/academics', [\App\Http\Controllers\PublicSiteController::class,'academics'])->name('site.academics');
Route::get('/admissions', [\App\Http\Controllers\PublicSiteController::class,'admissions'])->name('site.admissions');
Route::get('/contact', [\App\Http\Controllers\PublicSiteController::class,'contact'])->name('site.contact');
Route::get('/teachers', [\App\Http\Controllers\PublicSiteController::class,'teachers'])->name('site.teachers');
Route::get('/blog', [\App\Http\Controllers\PublicSiteController::class,'blogs'])->name('site.blogs');
Route::get('/blog/{slug}', [\App\Http\Controllers\PublicSiteController::class,'blog'])->name('site.blog.show');
Route::post('/admissions', [PublicInquiryController::class, 'admission'])
    ->middleware('throttle:5,1')->name('site.admissions.store');
Route::post('/contact', [PublicInquiryController::class, 'contact'])
    ->middleware('throttle:5,1')->name('site.contact.store');

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified', 'admin.access'])
    ->name('dashboard');
Route::get('/my-results', [DashboardController::class, 'results'])
    ->middleware(['auth', 'verified', 'permission:portal.results.view'])
    ->name('portal.results.view');
Route::middleware(['auth', 'verified', 'permission:portal.services.view'])->group(function () {
    Route::get('/student-services', [StudentPortalController::class, 'index'])->name('portal.services');
    Route::get('/student-services/receipts/{payment}', [StudentPortalController::class, 'receipt'])->name('portal.receipt');
    Route::get('/student-services/report-card/{exam}', [StudentPortalController::class, 'reportCard'])->middleware('permission:portal.results.view')->name('portal.report-card');
    Route::get('/student-services/transcript', [StudentPortalController::class, 'transcript'])->middleware('permission:portal.results.view')->name('portal.transcript');
    Route::post('/student-services/homework/{homework}', [StudentPortalController::class, 'submitHomework'])->name('portal.homework.submit');
    Route::get('/student-services/homework-submissions/{submission}/download', [StudentPortalController::class, 'downloadHomeworkSubmission'])->name('portal.homework-submission.download');
    Route::post('/student-services/leave', [StudentPortalController::class, 'leave'])->name('portal.leave.store');
    Route::get('/student-services/leaves/{leave}/download', [StudentPortalController::class, 'downloadLeaveAttachment'])->name('portal.leave.download');
    Route::post('/student-services/attendance-correction', [StudentPortalController::class, 'attendanceCorrection'])->name('portal.attendance-correction.store');
    Route::post('/student-services/profile-update', [StudentPortalController::class, 'profileUpdate'])->name('portal.profile-update.store');
    Route::post('/student-services/task', [StudentPortalController::class, 'toggleTask'])->name('portal.task.toggle');
    Route::post('/student-services/library-reservation', [StudentPortalController::class, 'reserveBook'])->name('portal.library-reservation.store');
    Route::post('/student-services/ticket', [StudentPortalController::class, 'ticket'])->name('portal.ticket.store');
    Route::post('/student-services/payment/{invoice}', [StudentPortalController::class, 'paymentRequest'])->name('portal.payment.request');
    Route::post('/payments/sslcommerz/{invoice}', [SslCommerzPaymentController::class, 'initiate'])->name('payments.sslcommerz.initiate');
});
Route::post('/payments/sslcommerz/success', [SslCommerzPaymentController::class, 'success'])->name('payments.sslcommerz.success');
Route::post('/payments/sslcommerz/ipn', [SslCommerzPaymentController::class, 'success'])->name('payments.sslcommerz.ipn');
Route::post('/webhooks/communications/{channel}', [CommunicationWebhookController::class,'delivery'])->whereIn('channel',['sms','whatsapp','push'])->middleware('throttle:120,1')->name('webhooks.communications.delivery');
Route::match(['get', 'post'], '/payments/sslcommerz/fail', [SslCommerzPaymentController::class, 'failed'])->name('payments.sslcommerz.fail');
Route::match(['get', 'post'], '/payments/sslcommerz/cancel', [SslCommerzPaymentController::class, 'failed'])->name('payments.sslcommerz.cancel');
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/learning/{student}/{kind}/{record}/download', [\App\Http\Controllers\StudentLearningController::class, 'download'])
        ->whereIn('kind', ['homework', 'syllabus', 'material'])->whereNumber('record')->name('portal.learning.download');
    Route::get('/staff-services', [PortalServiceController::class, 'staff'])->name('portal.staff.services');
    Route::post('/staff-services/leave', [PortalServiceController::class, 'staffLeave'])->name('portal.staff.leave');
    Route::get('/parent-services', [PortalServiceController::class, 'parent'])->name('portal.parent.services');
    Route::post('/parent-services/{service}', [PortalServiceController::class, 'parentRequest'])
        ->whereIn('service', ['message', 'meeting', 'leave'])->name('portal.parent.request');
    Route::post('/parent-services/phone/send-otp', [GuardianPortalController::class,'sendOtp'])->middleware('throttle:3,10')->name('portal.parent.otp.send');
    Route::post('/parent-services/phone/verify', [GuardianPortalController::class,'verifyOtp'])->middleware('throttle:10,10')->name('portal.parent.otp.verify');
    Route::patch('/parent-services/preferences', [GuardianPortalController::class,'preferences'])->name('portal.parent.preferences');
    Route::patch('/parent-services/consents/{consent}', [GuardianPortalController::class,'consent'])->name('portal.parent.consents.respond');
    Route::post('/parent-services/push-subscription', [GuardianPortalController::class,'subscribe'])->name('portal.parent.push.subscribe');
    Route::get('/parent-services/statement', [GuardianPortalController::class,'statement'])->name('portal.parent.statement');
    Route::get('/parent-services/receipts/{payment}', [GuardianPortalController::class,'receipt'])->name('portal.parent.receipt');
    Route::get('/parent-services/report-card/{student}/{exam}', [GuardianPortalController::class,'reportCard'])->name('portal.parent.report-card');
    Route::get('/parent-services/transcript/{student}', [GuardianPortalController::class,'transcript'])->name('portal.parent.transcript');
});
Route::middleware(['auth', 'verified', 'permission:portal.exams.attempt'])->group(function () {
    Route::get('/student-exams/{exam}', [StudentPortalController::class, 'startExam'])->name('portal.exams.start');
    Route::post('/student-exams/{exam}', [StudentPortalController::class, 'submitExam'])->name('portal.exams.submit');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});
Route::middleware(['auth', 'admin.access'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('student-service-reviews', [StudentServiceReviewController::class,'index'])->name('student-services.index');
    Route::get('secure-files/student-documents/{document}', [SecureFileController::class,'studentDocument'])->name('secure-files.student-document');
    Route::get('secure-files/applicants/{applicant}', [SecureFileController::class,'applicantResume'])->name('secure-files.applicant-resume');
    Route::get('secure-files/homework/{homework}', [SecureFileController::class,'homework'])->name('secure-files.homework');
    Route::get('secure-files/homework-submissions/{submission}', [SecureFileController::class,'homeworkSubmission'])->name('secure-files.homework-submission');
    Route::get('secure-files/lesson-plans/{lessonPlan}', [SecureFileController::class,'lessonPlan'])->name('secure-files.lesson-plan');
    Route::get('secure-files/staff-leaves/{leave}', [SecureFileController::class,'staffLeave'])->name('secure-files.staff-leave');
    Route::get('secure-files/student-leaves/{leave}', [SecureFileController::class,'studentLeave'])->name('secure-files.student-leave');
    Route::patch('student-service-reviews/homework/{submission}', [StudentServiceReviewController::class,'homework'])->name('student-services.homework');
    Route::patch('student-service-reviews/leave/{leave}', [StudentServiceReviewController::class,'leave'])->name('student-services.leave');
    Route::patch('student-service-reviews/correction/{correction}', [StudentServiceReviewController::class,'correction'])->name('student-services.correction');
    Route::patch('student-service-reviews/profile/{profile}', [StudentServiceReviewController::class,'profile'])->name('student-services.profile');
    Route::patch('student-service-reviews/reservation/{reservation}', [StudentServiceReviewController::class,'reservation'])->name('student-services.reservation');
    Route::get('/menu-manager', [MenuItemController::class, 'index'])->name('menu.index');
    Route::post('/menu-manager', [MenuItemController::class, 'store'])->name('menu.store');
    Route::put('/menu-manager/{menuItem}', [MenuItemController::class, 'update'])->name('menu.update');
    Route::delete('/menu-manager/{menuItem}', [MenuItemController::class, 'destroy'])->name('menu.destroy');
    Route::get('/menu-manager/export/excel', [MenuItemController::class, 'exportExcel'])->name('menu.export.excel');
    Route::get('/menu-manager/export/pdf', [MenuItemController::class, 'exportPdf'])->name('menu.export.pdf');
    Route::get('/menu-groups', [MenuGroupController::class, 'index'])->name('menu-groups.index');
    Route::post('/menu-groups', [MenuGroupController::class, 'store'])->name('menu-groups.store');
    Route::put('/menu-groups/{menuGroup}', [MenuGroupController::class, 'update'])->name('menu-groups.update');
    Route::delete('/menu-groups/{menuGroup}', [MenuGroupController::class, 'destroy'])->name('menu-groups.destroy');

    Route::resource('users', UserController::class);
    Route::resource('roles', RoleController::class);
    Route::resource('permissions', PermissionController::class);

    Route::post('/switch-campus', [CampusController::class, 'switchCampus'])->name('campus.switch');
    Route::resource('campuses', CampusController::class);
    Route::resource('sessions', AcademicSessionController::class);
    Route::resource('general', GeneralSettingController::class);
    Route::post('general/website', [GeneralSettingController::class, 'updateWebsite'])->name('general.website.update');
    Route::get('files/{file}/download', [FileManagerController::class, 'download'])->name('files.download');
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

    Route::get('time-tables/edit-day', [TimeTableController::class, 'editDay'])->name('time-tables.edit-day');
    Route::post('time-tables/bulk-update', [TimeTableController::class, 'bulkUpdate'])->name('time-tables.bulk-update');
    Route::resource('time-tables', TimeTableController::class);

    Route::resource('lesson-plans', LessonPlanController::class);
    Route::get('academic-operations', [AcademicOperationsController::class, 'index'])->name('academic-operations.index');
    Route::post('academic-operations/assignments', [AcademicOperationsController::class, 'assignment'])->name('academic-operations.assignment');
    Route::post('academic-operations/topics', [AcademicOperationsController::class, 'topic'])->name('academic-operations.topic');
    Route::patch('academic-operations/topics/{topic}/status', [AcademicOperationsController::class, 'topicStatus'])->name('academic-operations.topic-status');
    Route::post('academic-operations/diaries', [AcademicOperationsController::class, 'diary'])->name('academic-operations.diary');
    Route::post('academic-operations/substitutions', [AcademicOperationsController::class, 'substitution'])->name('academic-operations.substitution');
    Route::post('academic-operations/meetings', [AcademicOperationsController::class, 'meeting'])->name('academic-operations.meeting');
    Route::patch('academic-operations/meetings/{meeting}/status', [AcademicOperationsController::class, 'meetingStatus'])->name('academic-operations.meeting-status');
    Route::post('academic-operations/transfers', [AcademicOperationsController::class, 'transfer'])->name('academic-operations.transfer');
    Route::patch('academic-operations/transfers/{transfer}/approve', [AcademicOperationsController::class, 'approveTransfer'])->name('academic-operations.transfer-approve');

    Route::resource('communication-calendars', EventController::class);
    Route::resource('exams', ExamController::class);
    Route::patch('exams/{exam}/workflow', [ExamController::class, 'workflow'])->name('exams.workflow');
    Route::resource('exam-schedules', ExamScheduleController::class);
    Route::post('exams/schedule/bulk-update', [ExamScheduleController::class, 'bulkUpdate'])->name('exams.schedule.bulk-update');

    Route::resource('grades', GradeController::class);
    Route::delete('exams-marks/clear', [MarksController::class, 'destroy'])->name('exams-marks.destroy');
    Route::resource('exams-marks', MarksController::class);
    Route::get('exams/report/cards', [MarksController::class, 'examsReportcards'])->name('exams.reportcards');
    Route::get('exams/tabulation/sheet', [TabulationSheetController::class, 'index'])->name('exams.tabulation');

    Route::get('students/search-guardian', [StudentController::class, 'searchGuardian'])->name('students.search_guardian');
    Route::get('students/parents', [GuardianController::class, 'index'])->name('students.parents');
    Route::get('students/family-hub', [StudentGuardianOperationsController::class,'index'])->name('students.family-hub');
    Route::post('students/{student}/guardians/link', [StudentGuardianOperationsController::class,'link'])->name('students.guardians.link');
    Route::delete('students/{student}/guardians/{guardian}', [StudentGuardianOperationsController::class,'unlink'])->name('students.guardians.unlink');
    Route::post('students/{student}/authorized-pickups', [StudentGuardianOperationsController::class,'pickup'])->name('students.pickups.store');
    Route::patch('students/authorized-pickups/{pickup}', [StudentGuardianOperationsController::class,'pickupStatus'])->name('students.pickups.status');
    Route::post('students/{student}/guardian-notes', [StudentGuardianOperationsController::class,'note'])->name('students.guardian-notes.store');
    Route::post('students/{student}/consents', [StudentGuardianOperationsController::class,'consent'])->name('students.consents.store');
    Route::patch('students/clearances/{clearance}', [StudentGuardianOperationsController::class,'clearance'])->name('students.clearances.update');
    Route::get('students/promotions', [PromotionController::class, 'index'])->name('students.promotions');
    Route::post('students/promotions', [PromotionController::class, 'store'])->name('students.promotions.store');
    Route::post('students/promotions/{batch}/rollback', [PromotionController::class, 'rollback'])->name('students.promotions.rollback');

    Route::get('students/admissions', [StudentController::class, 'admissions'])->name('students.admissions');
    Route::get('students/documents', [StudentController::class, 'documents'])->name('students.documents');
    Route::get('students/discipline', [StudentController::class, 'discipline'])->name('students.discipline');

    Route::resource('students', StudentController::class);
    Route::resource('student-attendance', StudentAttendanceController::class);
    Route::get('attendance-control', [AttendanceOperationsController::class,'index'])->name('attendance-control.index');
    Route::post('attendance-control/policy', [AttendanceOperationsController::class,'policy'])->name('attendance-control.policy');
    Route::post('attendance-control/locks', [AttendanceOperationsController::class,'lock'])->name('attendance-control.lock');
    Route::delete('attendance-control/locks/{lock}', [AttendanceOperationsController::class,'unlock'])->name('attendance-control.unlock');
    Route::resource('student-development-records', StudentDevelopmentRecordController::class)->only(['index','store','update','destroy']);

    Route::resource('leave-types', LeaveTypeController::class);
    Route::resource('staff', StaffController::class);
    Route::get('staff/{staff}/report',[StaffController::class,'report'])->name('staff.report');
    Route::get('staff/{staff}/id-card',[StaffController::class,'generateIdCard'])->name('staff.id-card');
    Route::get('staff-attendance', [StaffAttendanceController::class, 'index'])->name('staff-attendance.index');
    Route::post('staff-attendance', [StaffAttendanceController::class, 'store'])->name('staff-attendance.store');
    Route::resource('staff-leaves', StaffLeaveController::class);
    Route::post('staff-payrolls/generate/automatic', [StaffPayrollController::class, 'generate'])->name('staff-payrolls.generate');
    Route::get('staff-payrolls/attendance/adjustments', [StaffPayrollController::class, 'attendance'])->name('staff-payrolls.attendance');
    Route::patch('staff-payrolls/attendance/{attendance}', [StaffPayrollController::class, 'attendanceAdjustment'])->name('staff-payrolls.attendance.update');
    Route::patch('staff-payrolls/{payroll}/approve', [StaffPayrollController::class, 'approve'])->name('staff-payrolls.approve');
    Route::patch('staff-payrolls/{payroll}/finalize', [StaffPayrollController::class, 'finalize'])->name('staff-payrolls.finalize');
    Route::get('staff-payrolls/export/bank-sheet', [StaffPayrollController::class, 'bankSheet'])->name('staff-payrolls.bank-sheet');
    Route::resource('staff-payrolls', StaffPayrollController::class);
    Route::resource('staff-hr-records', StaffHrRecordController::class)->only(['index', 'store', 'update', 'destroy']);

    Route::get('stff/attendances/report', [ReportController::class, 'staffAttendanceReport'])->name('staff.attendances-report');
    Route::post('/attendance-report', [ReportController::class, 'generate'])->name('attendance-report.generate');
    Route::get('fee-collection', [ReportController::class, 'feeCollection'])->name('reports.fees');
    Route::get('due-fees', [ReportController::class, 'dueFees'])->name('due_fees');
    Route::get('std/attendance/report', [ReportController::class, 'studentReport'])->name('studentAttendance.report');
    Route::get('/reports/saved', [ReportController::class, 'saved'])->name('reports.saved');
    Route::get('/reports/financial-summary', [ReportController::class, 'financialSummary'])->name('reports.financial-summary');

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

    Route::post('sms-logs/campaign', [SmsLogController::class, 'campaign'])->name('sms-logs.campaign');
    Route::resource('sms-logs', SmsLogController::class);
    Route::get('communication-center', [CommunicationCenterController::class,'index'])->name('communication-center.index');
    Route::post('communication-center/templates', [CommunicationCenterController::class,'template'])->name('communication-center.templates');
    Route::post('communication-center/segments', [CommunicationCenterController::class,'segment'])->name('communication-center.segments');
    Route::post('communication-center/campaigns', [CommunicationCenterController::class,'campaign'])->name('communication-center.campaigns');
    Route::patch('communication-center/campaigns/{campaign}/approve', [CommunicationCenterController::class,'approve'])->name('communication-center.approve');
    Route::post('communication-center/campaigns/{campaign}/dispatch', [CommunicationCenterController::class,'dispatch'])->name('communication-center.dispatch');
    Route::post('communication-center/balance', [CommunicationCenterController::class,'balance'])->name('communication-center.balance');
    Route::post('communication-center/preferences', [CommunicationCenterController::class,'preference'])->name('communication-center.preferences');
    Route::get('communication-center/metrics', [CommunicationCenterController::class,'metrics'])->name('communication-center.metrics');
    Route::resource('communication-notifications', CommunicationNotificationController::class);
    Route::resource('communication-helpdesk', HelpdeskTicketController::class)->names('communication.helpdesk');
    Route::post('communication-helpdesk/{id}/reply', [HelpdeskTicketController::class, 'reply'])->name('communication.helpdesk.reply');
    Route::resource('communication-cms', CommunicationCmsController::class)->names('communication.cms');
    Route::get('communication-chat', [CommunicationChatController::class, 'index'])->name('communication.chat.index');
    Route::post('communication-chat', [CommunicationChatController::class, 'store'])->name('communication.chat.store');
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
    Route::get('library-operations', [LibraryOperationsController::class,'index'])->name('library.operations');
    Route::post('library-operations/masters', [LibraryOperationsController::class,'master'])->name('library.masters');
    Route::post('library-operations/copies', [LibraryOperationsController::class,'copy'])->name('library.copies');
    Route::post('library-operations/members', [LibraryOperationsController::class,'member'])->name('library.members');
    Route::get('library-operations/scan', [LibraryOperationsController::class,'scan'])->name('library.scan');
    Route::post('library-operations/issues', [LibraryOperationsController::class,'issue'])->name('library.issue');
    Route::patch('library-operations/issues/{issue}/return', [LibraryOperationsController::class,'returnBook'])->name('library.return');
    Route::patch('library-operations/reservations/{reservation}', [LibraryOperationsController::class,'reservation'])->name('library.reservation');
    Route::post('library-operations/issues/{issue}/payment', [LibraryOperationsController::class,'finePayment'])->name('library.fine-payment');
    Route::post('library-operations/stock-checks', [LibraryOperationsController::class,'startStock'])->name('library.stock.start');
    Route::post('library-operations/stock-checks/{check}/scan', [LibraryOperationsController::class,'scanStock'])->name('library.stock.scan');
    Route::patch('library-operations/stock-checks/{check}/complete', [LibraryOperationsController::class,'completeStock'])->name('library.stock.complete');
    Route::resource('documents/certificatetemplates', CertificateTemplateController::class)->names('documents.certificatetemplates');
    Route::resource('documents/certificates', GeneratedCertificateController::class)->names('documents.certificates');
    Route::resource('documents/idcards', IdCardTemplateController::class)->names('documents.idcards');
    Route::resource('documents/transcripts', TranscriptTemplateController::class)->names('documents.transcripts');
    Route::resource('documents/official', OfficialDocumentController::class)->only(['index','store','destroy'])->names('documents.official');
    Route::resource('documents/official-templates', OfficialDocumentTemplateController::class)->only(['store','update','destroy'])->names('documents.official-templates');

    Route::resource('vehicles', VehicleController::class);
    Route::get('transport-operations',[TransportOperationsController::class,'index'])->name('transport.operations');
    Route::post('transport-operations/personnel',[TransportOperationsController::class,'personnel'])->name('transport.personnel');
    Route::post('transport-operations/personnel/assign',[TransportOperationsController::class,'assign'])->name('transport.personnel.assign');
    Route::post('transport-operations/stops',[TransportOperationsController::class,'stop'])->name('transport.stops');
    Route::post('transport-operations/fuel',[TransportOperationsController::class,'fuel'])->name('transport.fuel');
    Route::post('transport-operations/maintenance',[TransportOperationsController::class,'maintenance'])->name('transport.maintenance');
    Route::post('transport-operations/documents',[TransportOperationsController::class,'document'])->name('transport.documents');
    Route::post('transport-operations/boarding',[TransportOperationsController::class,'boarding'])->name('transport.boarding');
    Route::post('transport-operations/vehicles/{vehicle}/token',[TransportOperationsController::class,'token'])->name('transport.token');
    Route::post('transport-operations/expenses',[TransportOperationsController::class,'expense'])->name('transport.expenses');
    Route::post('transport-operations/fees/generate',[TransportOperationsController::class,'generateFees'])->name('transport.fees.generate');
    Route::resource('transports', TransportAllocationController::class);
    Route::resource('hostel-rooms', HostelRoomController::class);
    Route::resource('hostel-allocations', HostelAllocationController::class);
    Route::get('hostel-operations', [HostelOperationsController::class,'index'])->name('hostel.operations');
    Route::post('hostel-operations/beds', [HostelOperationsController::class,'bed'])->name('hostel.beds');
    Route::post('hostel-operations/check-in', [HostelOperationsController::class,'checkIn'])->name('hostel.check-in');
    Route::post('hostel-operations/allocations/{allocation}/move', [HostelOperationsController::class,'move'])->name('hostel.move');
    Route::post('hostel-operations/attendance', [HostelOperationsController::class,'attendance'])->name('hostel.attendance');
    Route::post('hostel-operations/visitors', [HostelOperationsController::class,'visitor'])->name('hostel.visitors');
    Route::patch('hostel-operations/visitors/{visitor}/checkout', [HostelOperationsController::class,'visitorCheckout'])->name('hostel.visitors.checkout');
    Route::post('hostel-operations/meals', [HostelOperationsController::class,'meal'])->name('hostel.meals');
    Route::post('hostel-operations/charges', [HostelOperationsController::class,'charge'])->name('hostel.charges');
    Route::post('hostel-operations/allocations/{allocation}/clearance', [HostelOperationsController::class,'clearance'])->name('hostel.clearance');
    Route::post('hostel-operations/allocations/{allocation}/settle', [HostelOperationsController::class,'settle'])->name('hostel.settle');
    Route::resource('library-issues', BookIssueController::class);

    Route::prefix('purchase')->name('purchase.')->group(function () {
        Route::resource('vendors', VendorController::class);
        Route::patch('items/stock-adjustments/{adjustment}', [PurchaseItemController::class,'decideAdjustment'])->name('items.stock-adjustments.decide');
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
    Route::get('purchase-items/report', [PurchaseItemController::class, 'report'])->name('purchase.items.report');

    Route::prefix('lms')->name('lms.')->group(function () {
        Route::resource('exams', OnlineExamController::class);
        Route::resource('questions', QuestionBankController::class);
        Route::resource('question-papers', QuestionPaperController::class)->only(['index','store','destroy']);
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

        // --- Student Profile Quick Actions (New Routes) ---
        Route::get('/{student}/id-card', [StudentController::class, 'generateIdCard'])->name('id-card');
        Route::get('/{student}/attendance', [StudentController::class, 'attendanceHistory'])->name('attendance');
        Route::get('/{student}/results', [StudentController::class, 'academicResults'])->name('results');
        Route::get('/{student}/fees', [StudentController::class, 'feePayments'])->name('fees');
        Route::get('/{student}/message', [StudentController::class, 'sendMessage'])->name('message');
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
    Route::post('sales/{sale}/void-request', [SaleController::class, 'requestVoid'])->name('sales.void-request');
    Route::patch('sales/void-requests/{voidRequest}', [SaleController::class, 'decideVoid'])->name('sales.void-decision');
    Route::get('/sales/reports', [SaleController::class, 'report'])->name('sales.reports.index');
    Route::resource('sales', SaleController::class);

    Route::prefix('cafeteria')->name('cafeteria.')->group(function () {
        Route::get('operations',[CafeteriaOperationsController::class,'index'])->name('operations');
        Route::post('operations/wallets',[CafeteriaOperationsController::class,'wallet'])->name('wallets');
        Route::post('operations/topups',[CafeteriaOperationsController::class,'topup'])->name('topups');
        Route::get('operations/identify',[CafeteriaOperationsController::class,'identify'])->name('identify');
        Route::post('operations/purchase',[CafeteriaOperationsController::class,'purchase'])->name('purchase');
        Route::patch('operations/orders/{order}/kitchen',[CafeteriaOperationsController::class,'kitchen'])->name('kitchen');
        Route::post('operations/orders/{order}/refund',[CafeteriaOperationsController::class,'refundRequest'])->name('refund.request');
        Route::patch('operations/refunds/{refund}',[CafeteriaOperationsController::class,'refundDecision'])->name('refund.decision');
        Route::post('operations/cash-closing',[CafeteriaOperationsController::class,'closeCash'])->name('cash-closing');
        Route::patch('operations/foods/{food}/stock',[CafeteriaOperationsController::class,'stock'])->name('stock');
        Route::resource('outlets', CafeteriaOutletController::class);
        Route::resource('menu-items', FoodItemController::class);
        Route::resource('orders', CafeteriaOrderController::class);
        Route::resource('meal-payments', MealPaymentController::class);
    });

    Route::prefix('medical')->name('medical.')->group(function () {
        Route::get('operations',[MedicalOperationsController::class,'index'])->name('operations');
        Route::post('operations/profile',[MedicalOperationsController::class,'profile'])->name('profile');
        Route::post('operations/consent',[MedicalOperationsController::class,'consent'])->name('consent');
        Route::post('operations/medicine-issue',[MedicalOperationsController::class,'issue'])->name('medicine-issue');
        Route::post('operations/appointments',[MedicalOperationsController::class,'appointment'])->name('appointments');
        Route::patch('operations/appointments/{appointment}',[MedicalOperationsController::class,'appointmentStatus'])->name('appointments.status');
        Route::post('operations/emergency',[MedicalOperationsController::class,'emergency'])->name('emergency');
        Route::post('operations/documents',[MedicalOperationsController::class,'document'])->name('documents');
        Route::get('operations/documents/{document}/download',[MedicalOperationsController::class,'download'])->name('documents.download');
        Route::resource('rooms', MedicalRoomController::class);
        Route::resource('visit-logs', VisitLogController::class);
        Route::resource('health-records', HealthRecordController::class);
        Route::resource('medicine-stock', MedicineStockController::class);
        Route::resource('vaccinations', VaccinationController::class);
    });

    Route::resource('workflow-builder', FormBuilderController::class);
    Route::resource('workflow-approvals', ApprovalWorkflowController::class);
    Route::get('reporting-administration',[ReportingAdministrationController::class,'index'])->name('reporting-administration.index');
    Route::post('reporting-administration/reports',[ReportingAdministrationController::class,'report'])->name('reporting-administration.reports');
    Route::get('reporting-administration/reports/{report}/preview',[ReportingAdministrationController::class,'preview'])->name('reporting-administration.preview');
    Route::get('reporting-administration/reports/{report}/export',[ReportingAdministrationController::class,'export'])->name('reporting-administration.export');
    Route::get('reporting-administration/exports/{export}',[ReportingAdministrationController::class,'download'])->name('reporting-administration.exports.download');
    Route::post('reporting-administration/schedules',[ReportingAdministrationController::class,'schedule'])->name('reporting-administration.schedules');
    Route::post('reporting-administration/imports',[ReportingAdministrationController::class,'import'])->name('reporting-administration.imports');
    Route::post('reporting-administration/imports/{batch}/rollback',[ReportingAdministrationController::class,'rollback'])->name('reporting-administration.imports.rollback');
    Route::post('reporting-administration/kpis',[ReportingAdministrationController::class,'kpi'])->name('reporting-administration.kpis');
    Route::resource('workflow-customfields', CustomFieldController::class);
    Route::post('biometric-devices/{device}/sync', [BiometricDeviceController::class, 'sync'])->name('biometric-devices.sync');
    Route::post('biometric-devices/{device}/token', [BiometricDeviceController::class, 'token'])->name('biometric-devices.token');
    Route::post('biometric-devices/{device}/simulate', [BiometricDeviceController::class, 'simulate'])->name('biometric-devices.simulate');
    Route::resource('biometric-devices', BiometricDeviceController::class);
    Route::resource('biometric-enrolledusers', BiometricEnrolledUserController::class);

    Route::get('biometric-synclogs', [BiometricSyncLogController::class, 'index'])->name('biometric.synclogs');
    Route::get('security-logins', [SecurityLoginController::class, 'index'])->name('security.logins');
    Route::get('security-failedlogins', [SecurityFailedLoginController::class, 'index'])->name('security.failedlogins');

    Route::resource('security-devices', SecurityTrustedDeviceController::class);
    Route::get('security-auditlogs', [SecurityAuditLogController::class, 'index'])->name('security.auditlogs');
    Route::get('security-operations',[SecurityOperationsController::class,'index'])->name('security.operations');
    Route::patch('security-operations/users/{user}',[SecurityOperationsController::class,'userPolicy'])->name('security.users.policy');
    Route::delete('security-operations/sessions/{id}',[SecurityOperationsController::class,'revokeSession'])->name('security.sessions.revoke');
    Route::post('security-operations/backups',[SecurityOperationsController::class,'backup'])->name('security.backups.create');
    Route::post('security-operations/backups/{backup}/verify',[SecurityOperationsController::class,'verify'])->name('security.backups.verify');
    Route::post('security-operations/backups/{backup}/restore',[SecurityOperationsController::class,'restore'])->middleware('password.confirm')->name('security.backups.restore');
    Route::post('security-operations/health',[SecurityOperationsController::class,'health'])->name('security.health');
    Route::post('security-operations/jobs/{id}/retry',[SecurityOperationsController::class,'retryJob'])->name('security.jobs.retry');
    Route::post('security-operations/retention',[SecurityOperationsController::class,'retention'])->name('security.retention');
    Route::resource('saas-tenants', SaasTenantController::class)->names('saas.tenants');
    Route::get('saas-control',[SaasControlController::class,'index'])->name('saas.control');
    Route::patch('saas-control/plans/{plan}',[SaasControlController::class,'planLimits'])->name('saas.plan-limits');
    Route::post('saas-control/provision',[SaasControlController::class,'provision'])->name('saas.provision');
    Route::patch('saas-control/tenants/{tenant}/status',[SaasControlController::class,'status'])->name('saas.status');
    Route::post('saas-control/tenants/{tenant}/verify-domain',[SaasControlController::class,'verifyDomain'])->name('saas.domain.verify');
    Route::post('saas-control/tenants/{tenant}/meter',[SaasControlController::class,'meter'])->name('saas.meter');
    Route::post('saas-control/tenants/{tenant}/invoices',[SaasControlController::class,'invoice'])->name('saas.invoice');
    Route::patch('saas-control/invoices/{invoice}/pay',[SaasControlController::class,'pay'])->name('saas.invoice.pay');
    Route::post('saas-control/tenants/{tenant}/backup',[SaasControlController::class,'backup'])->name('saas.tenant-backup');
    Route::resource('saas-plans', SaasPlanController::class)->names('saas.plans');
    Route::resource('saas-apikeys', SaasApiKeyController::class)->names('saas.apikeys');
    Route::resource('saas-ai', SaasAiAssistantController::class)->names('saas.ai');
    Route::resource('saas-backups', SaasBackupController::class)->names('saas.backups');
    Route::resource('saas-tasks', SaasScheduledTaskController::class)->names('saas.tasks');
    Route::resource('saas-queue', SaasQueueMonitorController::class)->names('saas.queue');

    Route::resource('study-materials', StudyMaterialController::class);
    Route::get('study-materials/{id}/download', [StudyMaterialController::class, 'download'])->name('study-materials.download');
    Route::resource('transport-routes', TransportRouteController::class)->names('transport.routes');

    Route::resource('staff-loans', StaffLoanController::class);
    Route::resource('staff-appraisals', StaffAppraisalController::class);
    Route::resource('accounting/chart', AccountingChartController::class)->names('accounting.chart');
    Route::resource('accounting/vouchers', AccountingVoucherController::class)->names('accounting.vouchers');
    Route::resource('hostel-fees', HostelFeeController::class);

    Route::get('email-logs', [EmailLogController::class, 'index'])->name('email-logs.index');
    Route::delete('email-logs/{id}', [EmailLogController::class, 'destroyLog'])->name('email-logs.destroy');

    // For Templates
    Route::post('email-templates', [EmailLogController::class, 'storeTemplate'])->name('email-templates.store');
    Route::put('email-templates/{id}', [EmailLogController::class, 'updateTemplate'])->name('email-templates.update');
    Route::delete('email-templates/{id}', [EmailLogController::class, 'destroyTemplate'])->name('email-templates.destroy');
});

require __DIR__.'/auth.php';

Route::middleware('auth')
    ->get('/{any}', DynamicPageController::class)
    ->where('any', '^(?!login|register|dashboard|profile|admin|logout).*$')
    ->name('dynamic.page');
