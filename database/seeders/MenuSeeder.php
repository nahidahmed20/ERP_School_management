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
                ['key' => 'dashboard', 'label' => 'Dashboard', 'icon' => 'grid', 'route' => 'admin.dashboard'],
            ]],

            ['label' => 'Academics', 'items' => [
                ['key' => 'students', 'label' => 'Students', 'icon' => 'cap', 'count' => 7, 'children' => [
                    ['key' => 'students.list', 'label' => 'Student List', 'route' => 'admin.students.index'],
                    ['key' => 'students.admissions', 'label' => 'Admissions', 'route' => 'admin.students.admissions'],
                    ['key' => 'students.parents', 'label' => 'Parents & Guardians', 'route' => 'admin.students.parents'],
                    ['key' => 'students.documents', 'label' => 'Student Documents', 'route' => 'admin.students.documents'],
                    ['key' => 'students.promotions', 'label' => 'Promotions', 'route' => 'admin.students.promotions'],
                    ['key' => 'students.categories', 'label' => 'Student Categories', 'route' => 'admin.students.categories'],
                    ['key' => 'students.houses', 'label' => 'Houses', 'route' => 'admin.students.houses'],
                ]],
                ['key' => 'classes', 'label' => 'Classes & Subjects', 'icon' => 'book', 'count' => 4, 'children' => [
                    ['key' => 'classes.list', 'label' => 'Classes', 'route' => 'admin.classes.index'],
                    ['key' => 'classes.sections', 'label' => 'Sections', 'route' => 'admin.classes.sections'],
                    ['key' => 'classes.subjects', 'label' => 'Subjects', 'route' => 'admin.classes.subjects'],
                    ['key' => 'classes.timetable', 'label' => 'Class Timetable', 'route' => 'admin.classes.timetable'],
                ]],
                ['key' => 'attendance', 'label' => 'Attendance', 'icon' => 'calendar', 'count' => 3, 'children' => [
                    ['key' => 'attendance.students', 'label' => 'Student Attendance', 'route' => 'admin.attendance.students'],
                    ['key' => 'attendance.staff', 'label' => 'Staff Attendance', 'route' => 'admin.attendance.staff'],
                    ['key' => 'attendance.sync', 'label' => 'Biometric Sync Logs', 'route' => 'admin.attendance.sync'],
                ]],
                ['key' => 'exams', 'label' => 'Exams & Marks', 'icon' => 'pencil', 'count' => 4, 'children' => [
                    ['key' => 'exams.schedule', 'label' => 'Exam Schedule', 'route' => 'admin.exams.schedule'],
                    ['key' => 'exams.marks', 'label' => 'Marks Entry', 'route' => 'admin.exams.marks'],
                    ['key' => 'exams.reportcards', 'label' => 'Report Cards', 'route' => 'admin.exams.reportcards'],
                    ['key' => 'exams.questionbanks', 'label' => 'Question Banks', 'route' => 'admin.exams.questionbanks'],
                ]],
            ]],

            ['label' => 'People', 'items' => [
                ['key' => 'staff', 'label' => 'Staff & HR', 'icon' => 'users', 'count' => 5, 'children' => [
                    ['key' => 'staff.directory', 'label' => 'Staff Directory', 'route' => 'admin.staff.index'],
                    ['key' => 'staff.departments', 'label' => 'Departments', 'route' => 'admin.staff.departments'],
                    ['key' => 'staff.designations', 'label' => 'Designations', 'route' => 'admin.staff.designations'],
                    ['key' => 'staff.leave', 'label' => 'Leave Management', 'route' => 'admin.staff.leave'],
                    ['key' => 'staff.payroll', 'label' => 'Payroll', 'route' => 'admin.staff.payroll'],
                ]],
                ['key' => 'recruitment', 'label' => 'Recruitment', 'icon' => 'briefcase', 'count' => 4, 'children' => [
                    ['key' => 'recruitment.jobs', 'label' => 'Job Posts', 'route' => 'admin.recruitment.jobs'],
                    ['key' => 'recruitment.applicants', 'label' => 'Applicants', 'route' => 'admin.recruitment.applicants'],
                    ['key' => 'recruitment.interviews', 'label' => 'Interviews', 'route' => 'admin.recruitment.interviews'],
                    ['key' => 'recruitment.offers', 'label' => 'Offer Letters', 'route' => 'admin.recruitment.offers'],
                ]],
            ]],

            ['label' => 'Finance', 'items' => [
                ['key' => 'fees', 'label' => 'Fees & Accounts', 'icon' => 'wallet', 'count' => 5, 'children' => [
                    ['key' => 'fees.groups', 'label' => 'Fee Groups & Types', 'route' => 'admin.fees.groups'],
                    ['key' => 'fees.studentfees', 'label' => 'Student Fee Assignment', 'route' => 'admin.fees.studentfees'],
                    ['key' => 'fees.invoices', 'label' => 'Invoices', 'route' => 'admin.fees.invoices'],
                    ['key' => 'fees.payments', 'label' => 'Payments', 'route' => 'admin.fees.payments'],
                    ['key' => 'fees.ledger', 'label' => 'Income / Expense Ledger', 'route' => 'admin.fees.ledger'],
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
                    ['key' => 'library.catalogue', 'label' => 'Catalogue', 'route' => 'admin.library.catalogue'],
                    ['key' => 'library.issues', 'label' => 'Book Issues & Fines', 'route' => 'admin.library.issues'],
                ]],
                ['key' => 'transport', 'label' => 'Transport & Hostel', 'icon' => 'bus', 'count' => 4, 'children' => [
                    ['key' => 'transport.hostels', 'label' => 'Hostels', 'route' => 'admin.transport.hostels'],
                    ['key' => 'transport.vehicles', 'label' => 'Vehicles & Routes', 'route' => 'admin.transport.vehicles'],
                    ['key' => 'transport.visitors', 'label' => 'Visitor Log', 'route' => 'admin.transport.visitors'],
                    ['key' => 'transport.complaints', 'label' => 'Complaints', 'route' => 'admin.transport.complaints'],
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
                    ['key' => 'lms.homework', 'label' => 'Homework', 'route' => 'admin.lms.homework'],
                    ['key' => 'lms.onlineexams', 'label' => 'Online Exams', 'route' => 'admin.lms.onlineexams'],
                    ['key' => 'lms.quizattempts', 'label' => 'Quiz Attempts', 'route' => 'admin.lms.quizattempts'],
                    ['key' => 'lms.questionbanks', 'label' => 'Question Banks', 'route' => 'admin.lms.questionbanks'],
                ]],
            ]],

            ['label' => 'Documents & Certificates', 'items' => [
                ['key' => 'documents', 'label' => 'Certificates & ID Cards', 'icon' => 'award', 'count' => 4, 'children' => [
                    ['key' => 'documents.certificatetemplates', 'label' => 'Certificate Templates', 'route' => 'admin.documents.certificatetemplates'],
                    ['key' => 'documents.certificates', 'label' => 'Generated Certificates', 'route' => 'admin.documents.certificates'],
                    ['key' => 'documents.idcards', 'label' => 'ID Card Templates', 'route' => 'admin.documents.idcards'],
                    ['key' => 'documents.transcripts', 'label' => 'Transcript Templates', 'route' => 'admin.documents.transcripts'],
                ]],
            ]],

            ['label' => 'Communication', 'items' => [
                ['key' => 'communication', 'label' => 'Chat, CMS & Alerts', 'icon' => 'chat', 'count' => 4, 'children' => [
                    ['key' => 'communication.chat', 'label' => 'Chat', 'route' => 'admin.communication.chat'],
                    ['key' => 'communication.notifications', 'label' => 'Notifications', 'route' => 'admin.communication.notifications'],
                    ['key' => 'communication.calendar', 'label' => 'Calendar & Events', 'route' => 'admin.communication.calendar'],
                    ['key' => 'communication.cms', 'label' => 'Website CMS', 'route' => 'admin.communication.cms'],
                ]],
            ]],

            ['label' => 'System', 'items' => [
                ['key' => 'reports', 'label' => 'Reports & Analytics', 'icon' => 'chart', 'count' => 3, 'children' => [
                    ['key' => 'reports.saved', 'label' => 'Saved Reports', 'route' => 'admin.reports.saved'],
                    ['key' => 'reports.widgets', 'label' => 'Dashboard Widgets', 'route' => 'admin.reports.widgets'],
                    ['key' => 'reports.analytics', 'label' => 'Usage Analytics', 'route' => 'admin.reports.analytics'],
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
                    ['key' => 'admin.school', 'label' => 'School & Branches', 'route' => 'admin.school'],
                    ['key' => 'admin.sessions', 'label' => 'Academic Sessions', 'route' => 'admin.sessions'],
                    ['key' => 'admin.general', 'label' => 'General Settings', 'route' => 'admin.general'],
                    ['key' => 'admin.roles.index', 'label' => 'Roles', 'route' => 'admin.roles.index'],
                    ['key' => 'admin.permissions.index', 'label' => 'Permissions', 'route' => 'admin.permissions.index'],
                    ['key' => 'admin.users.index', 'label' => 'User Accounts', 'route' => 'admin.users.index'],
                    ['key' => 'admin.files', 'label' => 'File Manager', 'route' => 'admin.files'],
                    ['key' => 'admin.menu.index', 'label' => 'Menu Manager', 'route' => 'admin.menu.index'],
                    ['key' => 'admin.registry', 'label' => 'System Registry & Diagnostics', 'route' => 'admin.registry'],
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
