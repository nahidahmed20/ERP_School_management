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
                    ['key' => 'frontoffice.inquiries', 'label' => 'Admission Inquiries', 'route' => 'admin.frontoffice.inquiries'],
                    ['key' => 'admin.frontoffice.visitors.index', 'label' => 'Visitor Book', 'route' => 'admin.frontoffice.visitors.index'],
                    ['key' => 'admin.frontoffice.notices.index', 'label' => 'Notice Board', 'route' => 'admin.frontoffice.notices.index'],
                    ['key' => 'frontoffice.calls', 'label' => 'Phone Call Logs', 'route' => 'admin.frontoffice.calls'],
                    ['key' => 'frontoffice.postal', 'label' => 'Postal Dispatch/Receive', 'route' => 'admin.frontoffice.postal'],
                ]],
            ]],

            ['label' => 'Academics', 'items' => [
                ['key' => 'students', 'label' => 'Students', 'icon' => 'cap', 'count' => 8, 'children' => [
                    ['key' => 'admin.students.index', 'label' => 'Student List', 'route' => 'admin.students.index'],
                    ['key' => 'admin.students.admissions', 'label' => 'Admissions', 'route' => 'admin.students.admissions'],
                    ['key' => 'admin.students.parents', 'label' => 'Parents & Guardians', 'route' => 'admin.students.parents'],
                    ['key' => 'admin.students.documents', 'label' => 'Student Documents', 'route' => 'admin.students.documents'],
                    ['key' => 'admin.students.promotions', 'label' => 'Promotions', 'route' => 'admin.students.promotions'],
                    ['key' => 'admin.students.discipline', 'label' => 'Disciplinary Records', 'route' => 'admin.students.discipline'], // নতুন
                    ['key' => 'admin.student-categories.index', 'label' => 'Student Categories', 'route' => 'admin.student-categories.index'],
                    ['key' => 'admin.houses.index', 'label' => 'Houses', 'route' => 'admin.houses.index'],
                ]],
                ['key' => 'classes', 'label' => 'Classes & Subjects', 'icon' => 'book', 'count' => 7, 'children' => [
                    ['key' => 'admin.classes.index', 'label' => 'Classes', 'route' => 'admin.classes.index'],
                    ['key' => 'admin.sections.index', 'label' => 'Sections', 'route' => 'admin.sections.index'],
                    ['key' => 'admin.subjects.index', 'label' => 'Subjects', 'route' => 'admin.subjects.index'],
                    ['key' => 'admin.classrooms.index', 'label' => 'Classroom', 'route' => 'admin.classrooms.index'],
                    ['key' => 'admin.time-tables.index', 'label' => 'Class Timetable', 'route' => 'admin.time-tables.index'],
                    ['key' => 'academics.lessonplans', 'label' => 'Lesson & Syllabus', 'route' => 'admin.academics.lessonplans'],
                    ['key' => 'admin.sessions.index', 'label' => 'Academic Sessions', 'route' => 'admin.sessions.index'],
                ]],
                ['key' => 'attendance', 'label' => 'Attendance', 'icon' => 'calendar', 'count' => 3, 'children' => [
                    ['key' => 'admin.student-attendance.index', 'label' => 'Student Attendance', 'route' => 'admin.student-attendance.index'],
                    ['key' => 'attendance.sync', 'label' => 'Biometric Sync Logs', 'route' => 'admin.attendance.sync'],
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
                    ['key' => 'exams.questionbanks', 'label' => 'Question Banks', 'route' => 'admin.exams.questionbanks'],
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
                    ['key' => 'recruitment.jobs', 'label' => 'Job Posts', 'route' => 'admin.recruitment.jobs'],
                    ['key' => 'recruitment.applicants', 'label' => 'Applicants', 'route' => 'admin.recruitment.applicants'],
                    ['key' => 'recruitment.interviews', 'label' => 'Interviews', 'route' => 'admin.recruitment.interviews'],
                    ['key' => 'recruitment.offers', 'label' => 'Offer Letters', 'route' => 'admin.recruitment.offers'],
                ]],
                ['key' => 'alumni', 'label' => 'Alumni Management', 'icon' => 'star', 'count' => 2, 'children' => [
                    ['key' => 'alumni.directory', 'label' => 'Alumni Directory', 'route' => 'admin.alumni.directory'],
                    ['key' => 'alumni.events', 'label' => 'Alumni Events', 'route' => 'admin.alumni.events'],
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
                    ['key' => 'payments.gateways', 'label' => 'Gateway Config', 'route' => 'admin.payments.gateways'],
                    ['key' => 'payments.transactions', 'label' => 'Transactions', 'route' => 'admin.payments.transactions'],
                    ['key' => 'payments.refunds', 'label' => 'Refunds', 'route' => 'admin.payments.refunds'],
                ]],
                ['key' => 'purchase', 'label' => 'Purchase & Assets', 'icon' => 'box', 'count' => 8, 'children' => [
                    ['key' => 'purchase.vendors', 'label' => 'Vendors', 'route' => 'admin.purchase.vendors'],
                    ['key' => 'purchase.suppliers', 'label' => 'Suppliers', 'route' => 'admin.purchase.suppliers'],
                    ['key' => 'purchase.items', 'label' => 'Inventory Items', 'route' => 'admin.purchase.items'],
                    ['key' => 'purchase.requests', 'label' => 'Purchase Requests', 'route' => 'admin.purchase.requests'],
                    ['key' => 'purchase.orders', 'label' => 'Purchase Orders', 'route' => 'admin.purchase.orders'],
                    ['key' => 'purchase.assets', 'label' => 'Asset Register', 'route' => 'admin.purchase.assets'],
                    ['key' => 'purchase.assetassignments', 'label' => 'Asset Assignments', 'route' => 'admin.purchase.assetassignments'],
                    ['key' => 'purchase.maintenance', 'label' => 'Asset Maintenance', 'route' => 'admin.purchase.maintenance'],
                ]],
            ]],

            ['label' => 'Campus Life', 'items' => [
                ['key' => 'library', 'label' => 'Library', 'icon' => 'book', 'count' => 2, 'children' => [
                    ['key' => 'admin.library.catalogue.inde', 'label' => 'Catalogue', 'route' => 'admin.library.catalogue.index'],
                    ['key' => 'library.issues', 'label' => 'Book Issues & Fines', 'route' => 'admin.library.issues'],
                ]],
                ['key' => 'transport', 'label' => 'Transport', 'icon' => 'bus', 'count' => 2, 'children' => [
                    ['key' => 'transport.vehicles', 'label' => 'Vehicles & Routes', 'route' => 'admin.transport.vehicles'],
                    ['key' => 'transport.allocations', 'label' => 'Transport Allocation', 'route' => 'admin.transport.allocations'],
                ]],
                ['key' => 'hostel', 'label' => 'Hostel Management', 'icon' => 'home', 'count' => 2, 'children' => [
                    ['key' => 'hostel.rooms', 'label' => 'Hostels & Rooms', 'route' => 'admin.hostel.rooms'],
                    ['key' => 'hostel.allocations', 'label' => 'Room Allocation', 'route' => 'admin.hostel.allocations'],
                ]],
                ['key' => 'cafeteria', 'label' => 'Cafeteria', 'icon' => 'cutlery', 'count' => 4, 'children' => [
                    ['key' => 'cafeteria.outlets', 'label' => 'Outlets', 'route' => 'admin.cafeteria.outlets'],
                    ['key' => 'cafeteria.menu', 'label' => 'Menu Items', 'route' => 'admin.cafeteria.menu'],
                    ['key' => 'cafeteria.orders', 'label' => 'Orders', 'route' => 'admin.cafeteria.orders'],
                    ['key' => 'cafeteria.payments', 'label' => 'Meal Payments', 'route' => 'admin.cafeteria.payments'],
                ]],
                ['key' => 'medical', 'label' => 'Medical Room', 'icon' => 'cross', 'count' => 5, 'children' => [
                    ['key' => 'medical.rooms', 'label' => 'Medical Rooms & Staff', 'route' => 'admin.medical.rooms'],
                    ['key' => 'medical.visits', 'label' => 'Visit Log', 'route' => 'admin.medical.visits'],
                    ['key' => 'medical.records', 'label' => 'Student Health Records', 'route' => 'admin.medical.records'],
                    ['key' => 'medical.medicines', 'label' => 'Medicine Stock', 'route' => 'admin.medical.medicines'],
                    ['key' => 'medical.vaccinations', 'label' => 'Vaccinations', 'route' => 'admin.medical.vaccinations'],
                ]],
            ]],

            ['label' => 'Learning', 'items' => [
                ['key' => 'lms', 'label' => 'LMS & Online Exams', 'icon' => 'laptop', 'count' => 6, 'children' => [
                    ['key' => 'lms.courses', 'label' => 'Courses', 'route' => 'admin.lms.courses'],
                    ['key' => 'lms.lessons', 'label' => 'Lessons', 'route' => 'admin.lms.lessons'],
                    ['key' => 'lms.homework', 'label' => 'Homework', 'route' => 'admin.lms.homework.index'],
                    ['key' => 'lms.onlineexams', 'label' => 'Online Exams', 'route' => 'admin.lms.onlineexams'],
                    ['key' => 'lms.quizattempts', 'label' => 'Quiz Attempts', 'route' => 'admin.lms.quizattempts'],
                    ['key' => 'lms.questionbanks', 'label' => 'Question Banks', 'route' => 'admin.lms.questionbanks'],
                ]],
            ]],

            ['label' => 'Documents & Certificates', 'items' => [
                ['key' => 'documents', 'label' => 'Certificates & ID Cards', 'icon' => 'award', 'count' => 4, 'children' => [
                    ['key' => 'documents.certificatetemplates', 'label' => 'Certificate Templates', 'route' => 'admin.documents.certificatetemplates.index'],
                    ['key' => 'documents.certificates', 'label' => 'Generated Certificates', 'route' => 'admin.documents.certificates'],
                    ['key' => 'documents.idcards', 'label' => 'ID Card Templates', 'route' => 'admin.documents.idcards'],
                    ['key' => 'documents.transcripts', 'label' => 'Transcript Templates', 'route' => 'admin.documents.transcripts'],
                ]],
            ]],

            ['label' => 'Communication', 'items' => [
                ['key' => 'communication', 'label' => 'Chat, CMS & Alerts', 'icon' => 'chat', 'count' => 6, 'children' => [
                    ['key' => 'communication.chat', 'label' => 'Chat', 'route' => 'admin.communication.chat'],
                    ['key' => 'communication.notifications', 'label' => 'Notifications', 'route' => 'admin.communication.notifications'],
                    ['key' => 'admin.communication-calendars.index', 'label' => 'Calendar & Events', 'route' => 'admin.communication-calendars.index'],
                    ['key' => 'communication.cms', 'label' => 'Website CMS', 'route' => 'admin.communication.cms'],
                    ['key' => 'communication.helpdesk', 'label' => 'Helpdesk / Tickets', 'route' => 'admin.communication.helpdesk'],
                    ['key' => 'admin.sms-logs', 'label' => 'SMS Logs', 'route' => 'admin.sms-logs'],
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
