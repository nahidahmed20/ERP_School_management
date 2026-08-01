<?php

namespace Database\Seeders;

use App\Models\MenuGroup;
use App\Models\MenuItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        MenuItem::truncate();
        MenuGroup::truncate();
        Schema::enableForeignKeyConstraints();

        $nav = [
            ['label' => 'Overview', 'items' => [
                ['key' => 'dashboard', 'label' => 'Dashboard', 'icon' => 'grid', 'route' => 'dashboard'],
            ]],

            ['label' => 'Front Office', 'items' => [
                ['key' => 'frontoffice', 'label' => 'Reception & Front Desk', 'icon' => 'phone', 'count' => 5, 'children' => [
                    ['key' => 'admin.frontoffice.admission-inquiries.index', 'label' => 'Admission Inquiries', 'route' => 'admin.frontoffice.admission-inquiries.index'],
                    ['key' => 'admin.frontoffice.visitors.index', 'label' => 'Visitor Book', 'route' => 'admin.frontoffice.visitors.index'],
                    ['key' => 'admin.frontoffice.notices.index', 'label' => 'Notice Board', 'route' => 'admin.frontoffice.notices.index'],
                    ['key' => 'admin.frontoffice.call-logs.index', 'label' => 'Phone Call Logs', 'route' => 'admin.frontoffice.call-logs.index'],
                    ['key' => 'admin.frontoffice.postal.index', 'label' => 'Postal Dispatch/Receive', 'route' => 'admin.frontoffice.postal.index'],
                ]],
            ]],

            ['label' => 'Academics', 'items' => [
                ['key' => 'students', 'label' => 'Students', 'icon' => 'cap', 'count' => 9, 'children' => [
                    ['key' => 'admin.students.index', 'label' => 'Student List', 'route' => 'admin.students.index'],
                    ['key' => 'admin.students.create', 'label' => 'Student Admissions', 'route' => 'admin.students.create'],
                    ['key' => 'admin.students.admissions.index', 'label' => 'Online Admissions', 'route' => 'admin.students.admissions.index'],
                    ['key' => 'admin.students.parents', 'label' => 'Parents & Guardians', 'route' => 'admin.students.parents'],
                    ['key' => 'admin.students.documents.index', 'label' => 'Student Documents', 'route' => 'admin.students.documents.index'],
                    ['key' => 'admin.students.promotions', 'label' => 'Promotions', 'route' => 'admin.students.promotions'],
                    ['key' => 'admin.students.discipline.index', 'label' => 'Disciplinary Records', 'route' => 'admin.students.discipline.index'],
                    ['key' => 'admin.student-categories.index', 'label' => 'Student Categories', 'route' => 'admin.student-categories.index'],
                    ['key' => 'admin.houses.index', 'label' => 'Houses', 'route' => 'admin.houses.index'],
                ]],
                ['key' => 'classes', 'label' => 'Classes & Subjects', 'icon' => 'book', 'count' => 7, 'children' => [
                    ['key' => 'admin.classes.index', 'label' => 'Classes', 'route' => 'admin.classes.index'],
                    ['key' => 'admin.sections.index', 'label' => 'Sections', 'route' => 'admin.sections.index'],
                    ['key' => 'admin.subjects.index', 'label' => 'Subjects', 'route' => 'admin.subjects.index'],
                    ['key' => 'admin.classrooms.index', 'label' => 'Classroom', 'route' => 'admin.classrooms.index'],
                    ['key' => 'admin.time-tables.index', 'label' => 'Class Timetable', 'route' => 'admin.time-tables.index'],
                    ['key' => 'admin.lesson-plans.index', 'label' => 'Lesson & Syllabus', 'route' => 'admin.lesson-plans.index'],
                    ['key' => 'admin.sessions.index', 'label' => 'Academic Sessions', 'route' => 'admin.sessions.index'],
                ]],
                ['key' => 'attendance', 'label' => 'Attendance', 'icon' => 'calendar', 'count' => 3, 'children' => [
                    ['key' => 'admin.student-attendance.index', 'label' => 'Student Attendance', 'route' => 'admin.student-attendance.index'],
                    ['key' => 'admin.biometric.sync-logs.index', 'label' => 'Biometric Sync Logs', 'route' => 'admin.biometric.sync-logs.index'],
                    ['key' => 'admin.student_attendance.report', 'label' => 'Student Attendance Report', 'route' => 'admin.student_attendance.report'],
                    ['key' => 'admin.attendance-report.index', 'label' => 'Staff Attendance', 'route' => 'admin.attendance-report.index'],
                ]],
                ['key' => 'exams', 'label' => 'Exams & Marks', 'icon' => 'pencil', 'count' => 5, 'children' => [
                    ['key' => 'admin.exams.index', 'label' => 'Exam List', 'route' => 'admin.exams.index'],
                    ['key' => 'admin.exam-schedules.index', 'label' => 'Exam Schedule', 'route' => 'admin.exam-schedules.index'],
                    ['key' => 'admin.exams-marks.index', 'label' => 'Marks Entry', 'route' => 'admin.exams-marks.index'],
                    ['key' => 'admin.grades.index', 'label' => 'Grade Setup', 'route' => 'admin.grades.index'],
                    ['key' => 'admin.exams.reportcards', 'label' => 'Report Cards', 'route' => 'admin.exams.reportcards'],
                    ['key' => 'admin.exams.tabulation', 'label' => 'Tabulation Sheet', 'route' => 'admin.exams.tabulation'],
                ]],
            ]],

            ['label' => 'People', 'items' => [
                ['key' => 'staff', 'label' => 'Staff & HR', 'icon' => 'users', 'count' => 7, 'children' => [
                    ['key' => 'admin.staff.index', 'label' => 'Staff Directory', 'route' => 'admin.staff.index'],
                    ['key' => 'admin.staff-attendance.index', 'label' => 'Daily Attendance', 'route' => 'admin.staff-attendance.index'],
                    ['key' => 'admin.staff-leaves.index', 'label' => 'Leave Applications', 'route' => 'admin.staff-leaves.index'],
                    ['key' => 'admin.staff-payrolls.index', 'label' => 'Payroll Management', 'route' => 'admin.staff-payrolls.index'],
                    ['key' => 'admin.departments.index', 'label' => 'Departments', 'route' => 'admin.departments.index'],
                    ['key' => 'admin.designations.index', 'label' => 'Designations', 'route' => 'admin.designations.index'],
                    ['key' => 'admin.leave-types.index', 'label' => 'Leave Types', 'route' => 'admin.leave-types.index'],
                ]],
                ['key' => 'recruitment', 'label' => 'Recruitment', 'icon' => 'briefcase', 'count' => 4, 'children' => [
                    ['key' => 'admin.recruitment.job-posts.index', 'label' => 'Job Posts', 'route' => 'admin.recruitment.job-posts.index'],
                    ['key' => 'admin.recruitment.applicants.index', 'label' => 'Applicants', 'route' => 'admin.recruitment.applicants.index'],
                    ['key' => 'admin.recruitment.interviews.index', 'label' => 'Interviews', 'route' => 'admin.recruitment.interviews.index'],
                    ['key' => 'admin.recruitment.offer-letters.index', 'label' => 'Offer Letters', 'route' => 'admin.recruitment.offer-letters.index'],
                ]],
                ['key' => 'alumni', 'label' => 'Alumni Management', 'icon' => 'star', 'count' => 2, 'children' => [
                    ['key' => 'admin.alumni.directory.index', 'label' => 'Alumni Directory', 'route' => 'admin.alumni.directory.index'],
                    ['key' => 'admin.alumni.events.index', 'label' => 'Alumni Events', 'route' => 'admin.alumni.events.index'],
                ]],
            ]],

            ['label' => 'Finance', 'items' => [
                ['key' => 'fees', 'label' => 'Fees & Accounts', 'icon' => 'wallet', 'count' => 5, 'children' => [
                    ['key' => 'admin.fees-groups.index', 'label' => 'Fee Groups & Types', 'route' => 'admin.fees-groups.index'],
                    ['key' => 'admin.studentfees.index', 'label' => 'Student Fee Assignment', 'route' => 'admin.studentfees.index'],
                    ['key' => 'admin.fees.invoices', 'label' => 'Invoices', 'route' => 'admin.fees.invoices'],
                    ['key' => 'admin.fees.payments', 'label' => 'Payments', 'route' => 'admin.fees.payments'],
                    ['key' => 'admin.fees.ledger', 'label' => 'Income / Expense Ledger', 'route' => 'admin.fees.ledger'],
                ]],
                ['key' => 'payments', 'label' => 'Payment Gateways', 'icon' => 'card', 'count' => 3, 'children' => [
                    ['key' => 'admin.payments.gateways.index', 'label' => 'Gateway Config', 'route' => 'admin.payments.gateways.index'],
                    ['key' => 'admin.payments.transactions.index', 'label' => 'Transactions', 'route' => 'admin.payments.transactions.index'],
                    ['key' => 'admin.payments.refunds.index', 'label' => 'Refunds', 'route' => 'admin.payments.refunds.index'],
                ]],
                ['key' => 'purchase', 'label' => 'Inventory & Assets', 'icon' => 'box', 'count' => 7, 'children' => [
                    ['key' => 'admin.purchase.items.index', 'label' => 'Products & Items', 'route' => 'admin.purchase.items.index'],
                    ['key' => 'admin.purchase.suppliers.index', 'label' => 'Suppliers ', 'route' => 'admin.purchase.suppliers.index'],
                    ['key' => 'admin.purchase.vendors.index', 'label' => 'Vendors', 'route' => 'admin.purchase.vendors.index'],
                    ['key' => 'admin.purchase.requests.index', 'label' => 'Purchase Requests', 'route' => 'admin.purchase.requests.index'],
                    ['key' => 'admin.purchase.orders.index', 'label' => 'Purchase Orders', 'route' => 'admin.purchase.orders.index'],
                    ['key' => 'admin.purchase.orders.create', 'label' => 'Purchase Orders Create', 'route' => 'admin.purchase.orders.create'],
                    ['key' => 'admin.purchase.assets.index', 'label' => 'Fixed Assets', 'route' => 'admin.purchase.assets.index'],
                    ['key' => 'admin.purchase.asset-assignments.index', 'label' => 'Issue Assets', 'route' => 'admin.purchase.asset-assignments.index'],
                    ['key' => 'admin.purchase.asset-maintenance.index', 'label' => 'Asset Repairs', 'route' => 'admin.purchase.asset-maintenance.index'],
                ]],
                ['key' => 'sales', 'label' => 'Sales & POS', 'icon' => 'cart', 'count' => 3, 'children' => [
                    ['key' => 'admin.sales.create', 'label' => 'Point of Sale (POS)', 'route' => 'admin.sales.create'],
                    ['key' => 'admin.sales.index', 'label' => 'Sales Receipts', 'route' => 'admin.sales.index'],
                    ['key' => 'admin.sales.reports.index', 'label' => 'Sales Reports', 'route' => 'admin.sales.reports.index'],
                ]],
            ]],

            ['label' => 'Campus Life', 'items' => [
                ['key' => 'library', 'label' => 'Library', 'icon' => 'book', 'count' => 2, 'children' => [
                    ['key' => 'admin.library.catalogue.index', 'label' => 'Catalogue', 'route' => 'admin.library.catalogue.index'],
                    ['key' => 'admin.library-issues.index', 'label' => 'Book Issues & Fines', 'route' => 'admin.library-issues.index'],
                ]],
                ['key' => 'transport', 'label' => 'Transport', 'icon' => 'bus', 'count' => 2, 'children' => [
                    ['key' => 'admin.vehicles.index', 'label' => 'Vehicles', 'route' => 'admin.vehicles.index'],
                    ['key' => 'admin.transports.index', 'label' => 'Transport Allocation', 'route' => 'admin.transports.index'],
                ]],
                ['key' => 'hostel', 'label' => 'Hostel Management', 'icon' => 'home', 'count' => 2, 'children' => [
                    ['key' => 'admin.hostel-rooms.index', 'label' => 'Hostels & Rooms', 'route' => 'admin.hostel-rooms.index'],
                    ['key' => 'admin.hostel-allocations.index', 'label' => 'Room Allocation', 'route' => 'admin.hostel-allocations.index'],
                ]],
                ['key' => 'cafeteria', 'label' => 'Cafeteria', 'icon' => 'cutlery', 'count' => 4, 'children' => [
                    ['key' => 'admin.cafeteria.outlets.index', 'label' => 'Outlets', 'route' => 'admin.cafeteria.outlets.index'],
                    ['key' => 'admin.cafeteria.menu-items.index', 'label' => 'Menu Items', 'route' => 'admin.cafeteria.menu-items.index'],
                    ['key' => 'admin.cafeteria.orders.index', 'label' => 'Orders', 'route' => 'admin.cafeteria.orders.index'],
                    ['key' => 'admin.cafeteria.meal-payments.index', 'label' => 'Meal Payments', 'route' => 'admin.cafeteria.meal-payments.index'],
                ]],
                ['key' => 'medical', 'label' => 'Medical Room', 'icon' => 'cross', 'count' => 5, 'children' => [
                    ['key' => 'admin.medical.rooms.index', 'label' => 'Medical Rooms', 'route' => 'admin.medical.rooms.index'],
                    ['key' => 'admin.medical.visit-logs.index', 'label' => 'Visit Log', 'route' => 'admin.medical.visit-logs.index'],
                    ['key' => 'admin.medical.health-records.index', 'label' => 'Student Health Records', 'route' => 'admin.medical.health-records.index'],
                    ['key' => 'admin.medical.medicine-stock.index', 'label' => 'Medicine Stock', 'route' => 'admin.medical.medicine-stock.index'],
                    ['key' => 'admin.medical.vaccinations.index', 'label' => 'Vaccinations', 'route' => 'admin.medical.vaccinations.index'],
                ]],
            ]],

            ['label' => 'Learning', 'items' => [
                ['key' => 'lms', 'label' => 'LMS & Online Exams', 'icon' => 'laptop', 'count' => 7, 'children' => [
                    ['key' => 'admin.lms.courses.index', 'label' => 'Courses', 'route' => 'admin.lms.courses.index'],
                    ['key' => 'admin.lms.lessons.index', 'label' => 'Lessons', 'route' => 'admin.lms.lessons.index'],
                    ['key' => 'admin.lms.homework.index', 'label' => 'Homework', 'route' => 'admin.lms.homework.index'],
                    ['key' => 'admin.lms.exams.index', 'label' => 'Online Exams', 'route' => 'admin.lms.exams.index'],
                    ['key' => 'admin.lms.quizattempts.index', 'label' => 'Quiz Attempts', 'route' => 'admin.lms.quizattempts.index'],
                    ['key' => 'admin.lms.questions.index', 'label' => 'Question Banks', 'route' => 'admin.lms.questions.index'],
                    ['key' => 'admin.lms.exam-questions.index', 'label' => 'Assign Questions', 'route' => 'admin.lms.exam-questions.index'],
                ]],
            ]],

            ['label' => 'Documents & Certificates', 'items' => [
                ['key' => 'documents', 'label' => 'Certificates & ID Cards', 'icon' => 'award', 'count' => 4, 'children' => [
                    ['key' => 'admin.documents.certificatetemplates.index', 'label' => 'Certificate Templates', 'route' => 'admin.documents.certificatetemplates.index'],
                    ['key' => 'admin.documents.certificates.index', 'label' => 'Generated Certificates', 'route' => 'admin.documents.certificates.index'],
                    ['key' => 'admin.documents.idcards.index', 'label' => 'ID Card Templates', 'route' => 'admin.documents.idcards.index'],
                    ['key' => 'admin.documents.transcripts.index', 'label' => 'Transcript Templates', 'route' => 'admin.documents.transcripts.index'],
                ]],
            ]],

            ['label' => 'Communication', 'items' => [
                ['key' => 'communication', 'label' => 'Chat, CMS & Alerts', 'icon' => 'chat', 'count' => 6, 'children' => [
                    ['key' => 'admin.communication.chat.index', 'label' => 'Chat', 'route' => 'admin.communication.chat.index'],
                    ['key' => 'admin.communication-notifications.index', 'label' => 'Notifications', 'route' => 'admin.communication-notifications.index'],
                    ['key' => 'admin.communication-calendars.index', 'label' => 'Calendar & Events', 'route' => 'admin.communication-calendars.index'],
                    ['key' => 'admin.communication.cms.index', 'label' => 'Website CMS', 'route' => 'admin.communication.cms.index'],
                    ['key' => 'admin.communication.helpdesk.index', 'label' => 'Helpdesk / Tickets', 'route' => 'admin.communication.helpdesk.index'],
                    ['key' => 'admin.sms-logs.index', 'label' => 'SMS Logs', 'route' => 'admin.sms-logs.index'],
                ]],
            ]],

            ['label' => 'System', 'items' => [
                ['key' => 'reports', 'label' => 'Reports & Analytics', 'icon' => 'chart', 'count' => 4, 'children' => [
                    ['key' => 'reports.saved', 'label' => 'Saved Reports', 'route' => 'admin.reports.saved'],
                    ['key' => 'reports.widgets', 'label' => 'Dashboard Widgets', 'route' => 'admin.reports.widgets'],
                    ['key' => 'reports.analytics', 'label' => 'Usage Analytics', 'route' => 'admin.reports.analytics'],
                    ['key' => 'admin.reports.fees', 'label' => 'Fee Collection Report', 'route' => 'admin.reports.fees'],
                    ['key' => 'admin.due_fees', 'label' => 'Due Fee Report', 'route' => 'admin.due_fees']
                ]],
                ['key' => 'workflow', 'label' => 'Workflow & Forms', 'icon' => 'workflow', 'count' => 3, 'children' => [
                    ['key' => 'workflow.builder', 'label' => 'Form Builder', 'route' => 'admin.workflow.builder'],
                    ['key' => 'workflow.approvals', 'label' => 'Approval Workflows', 'route' => 'admin.workflow.approvals'],
                    ['key' => 'workflow.customfields', 'label' => 'Custom Fields', 'route' => 'admin.workflow.customfields'],
                ]],
                ['key' => 'biometric', 'label' => 'Biometric Devices', 'icon' => 'fingerprint', 'count' => 3, 'children' => [
                    ['key' => 'biometric.devices', 'label' => 'Device Registry', 'route' => 'admin.biometric.devices'],
                    ['key' => 'biometric.enrolledusers', 'label' => 'Enrolled Users', 'route' => 'admin.biometric.enrolledusers'],
                    ['key' => 'biometric.synclogs', 'label' => 'Sync Logs', 'route' => 'admin.biometric.synclogs'],
                ]],
                ['key' => 'security', 'label' => 'Security Logs', 'icon' => 'shield', 'count' => 4, 'children' => [
                    ['key' => 'security.logins', 'label' => 'Login History', 'route' => 'admin.security.logins'],
                    ['key' => 'security.failedlogins', 'label' => 'Failed Login Attempts', 'route' => 'admin.security.failedlogins'],
                    ['key' => 'security.devices', 'label' => 'Trusted Devices', 'route' => 'admin.security.devices'],
                    ['key' => 'security.audit', 'label' => 'Audit Logs', 'route' => 'admin.security.audit'],
                ]],
                ['key' => 'saas', 'label' => 'SaaS, AI & Backups', 'icon' => 'cloud', 'count' => 7, 'children' => [
                    ['key' => 'saas.tenants', 'label' => 'Tenants & Billing', 'route' => 'admin.saas.tenants'],
                    ['key' => 'saas.plans', 'label' => 'Subscription Plans', 'route' => 'admin.saas.plans'],
                    ['key' => 'saas.apikeys', 'label' => 'API Keys & Logs', 'route' => 'admin.saas.apikeys'],
                    ['key' => 'saas.ai', 'label' => 'AI Assistant', 'route' => 'admin.saas.ai'],
                    ['key' => 'saas.backups', 'label' => 'Backups', 'route' => 'admin.saas.backups'],
                    ['key' => 'saas.tasks', 'label' => 'Scheduled Tasks', 'route' => 'admin.saas.tasks'],
                    ['key' => 'saas.queue', 'label' => 'Queue Monitor', 'route' => 'admin.saas.queue'],
                ]],
                ['key' => 'settings', 'label' => 'Settings & Registry', 'icon' => 'settings', 'count' => 8, 'children' => [
                    ['key' => 'admin.campuses.index', 'label' => 'School & Branches', 'route' => 'admin.campuses.index'],
                    ['key' => 'admin.general.index', 'label' => 'General Settings', 'route' => 'admin.general.index'],
                    ['key' => 'admin.roles.index', 'label' => 'Roles', 'route' => 'admin.roles.index'],
                    ['key' => 'admin.permissions.index', 'label' => 'Permissions', 'route' => 'admin.permissions.index'],
                    ['key' => 'admin.users.index', 'label' => 'User Accounts', 'route' => 'admin.users.index'],
                    ['key' => 'admin.files.index', 'label' => 'File Manager', 'route' => 'admin.files.index'],
                    ['key' => 'admin.menu.index', 'label' => 'Menu Manager', 'route' => 'admin.menu.index'],
                    ['key' => 'admin.registry.index', 'label' => 'System Registry & Diagnostics', 'route' => 'admin.registry.index'],
                ]],
            ]],
        ];

        foreach ($nav as $gOrder => $group) {
            $g = MenuGroup::create(['label' => $group['label'], 'order' => $gOrder]);

            foreach ($group['items'] as $iOrder => $item) {
                $parent = MenuItem::create([
                    'menu_group_id' => $g->id,
                    'key'           => $item['key'],
                    'label'         => $item['label'],
                    'icon'          => $item['icon'] ?? null,
                    'route_name'    => $item['route'] ?? null,
                    'badge_count'   => $item['count'] ?? null,
                    'order'         => $iOrder,
                ]);

                foreach ($item['children'] ?? [] as $cOrder => $child) {
                    MenuItem::create([
                        'menu_group_id' => $g->id,
                        'parent_id'     => $parent->id,
                        'key'           => $child['key'],
                        'label'         => $child['label'],
                        'route_name'    => $child['route'],
                        'order'         => $cOrder,
                    ]);
                }
            }
        }
    }
}
