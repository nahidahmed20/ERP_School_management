<?php

namespace App\Services;

use App\Models\MenuGroup;
use App\Models\MenuItem;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class MenuOrderService
{
    /** @var list<string> */
    private const GROUPS = [
        'Overview',
        'Front Office',
        'Academics',
        'People',
        'Finance',
        'Learning',
        'Campus Life',
        'Documents & Certificates',
        'Communication',
        'System',
    ];

    /** @var array<string, list<string>> */
    private const PARENTS = [
        'Overview' => ['dashboard'],
        'Front Office' => ['frontoffice'],
        'Academics' => ['students', 'classes', 'attendance', 'exams'],
        'People' => ['staff', 'recruitment', 'alumni'],
        'Finance' => ['fees', 'payments', 'purchase', 'sales'],
        'Learning' => ['lms'],
        'Campus Life' => ['library', 'transport', 'hostel', 'cafeteria', 'medical'],
        'Documents & Certificates' => ['documents'],
        'Communication' => ['communication'],
        'System' => ['reports', 'workflow', 'biometric', 'security', 'saas', 'settings'],
    ];

    /** @var array<string, list<string>> */
    private const CHILDREN = [
        'frontoffice' => [
            'admin.frontoffice.admission-inquiries.index',
            'admin.frontoffice.visitors.index',
            'admin.frontoffice.call-logs.index',
            'admin.frontoffice.postal.index',
            'admin.frontoffice.notices.index',
        ],
        'students' => [
            'admin.students.index',
            'admin.students.create',
            'admin.students.admissions.index',
            'admin.students.parents',
            'admin.students.family-hub',
            'admin.students.documents.index',
            'admin.student-development-records.index',
            'admin.students.promotions',
            'admin.students.discipline.index',
            'admin.student-categories.index',
            'admin.houses.index',
            'admin.student-services.index',
        ],
        'classes' => [
            'admin.sessions.index',
            'admin.classes.index',
            'admin.sections.index',
            'admin.subjects.index',
            'admin.classrooms.index',
            'admin.time-tables.index',
            'admin.lesson-plans.index',
            'admin.academic-operations.index',
            'admin.study-materials.index',
        ],
        'attendance' => [
            'admin.attendance-control.index',
            'admin.student-attendance.index',
            'admin.student_attendance.report',
            'admin.attendance-report.index',
            'admin.biometric.sync-logs.index',
        ],
        'exams' => [
            'admin.grades.index',
            'admin.exams.index',
            'admin.exam-schedules.index',
            'admin.exams-marks.index',
            'admin.exams.tabulation',
            'admin.exams.reportcards',
        ],
        'staff' => [
            'admin.staff.index',
            'admin.departments.index',
            'admin.designations.index',
            'admin.staff-attendance.index',
            'admin.staff-leaves.index',
            'admin.leave-types.index',
            'admin.staff-payrolls.index',
            'admin.staff-payrolls.attendance',
            'admin.staff-loans.index',
            'admin.staff-hr-records.index',
            'admin.staff-appraisals.index',
        ],
        'recruitment' => [
            'admin.recruitment.job-posts.index',
            'admin.recruitment.applicants.index',
            'admin.recruitment.interviews.index',
            'admin.recruitment.offer-letters.index',
        ],
        'alumni' => ['admin.alumni.directory.index', 'admin.alumni.events.index'],
        'fees' => [
            'admin.fees-groups.index',
            'admin.studentfees.index',
            'admin.fees.invoices',
            'admin.fees.payments',
            'admin.fees.ledger',
            'admin.accounting.chart.index',
            'admin.accounting.vouchers.index',
        ],
        'payments' => [
            'admin.payments.gateways.index',
            'admin.payments.transactions.index',
            'admin.payments.refunds.index',
        ],
        'purchase' => [
            'admin.purchase.items.index',
            'admin.purchase.suppliers.index',
            'admin.purchase.vendors.index',
            'admin.purchase.requests.index',
            'admin.purchase.orders.index',
            'admin.purchase.orders.create',
            'admin.purchase.assets.index',
            'admin.purchase.asset-assignments.index',
            'admin.purchase.asset-maintenance.index',
        ],
        'sales' => ['admin.sales.create', 'admin.sales.index', 'admin.sales.reports.index'],
        'lms' => [
            'admin.lms.courses.index',
            'admin.lms.lessons.index',
            'admin.lms.homework.index',
            'admin.lms.questions.index',
            'admin.lms.question-papers.index',
            'admin.lms.exam-questions.index',
            'admin.lms.exams.index',
            'admin.lms.quizattempts.index',
        ],
        'library' => ['admin.library.operations', 'admin.library.catalogue.index', 'admin.library-issues.index'],
        'transport' => ['admin.transport.operations','admin.transport.routes.index', 'admin.vehicles.index', 'admin.transports.index'],
        'hostel' => ['admin.hostel.operations', 'admin.hostel-rooms.index', 'admin.hostel-allocations.index', 'admin.hostel-fees.index'],
        'cafeteria' => [
            'admin.cafeteria.operations',
            'admin.cafeteria.outlets.index',
            'admin.cafeteria.menu-items.index',
            'admin.cafeteria.orders.index',
            'admin.cafeteria.meal-payments.index',
        ],
        'medical' => [
            'admin.medical.operations',
            'admin.medical.rooms.index',
            'admin.medical.visit-logs.index',
            'admin.medical.health-records.index',
            'admin.medical.medicine-stock.index',
            'admin.medical.vaccinations.index',
        ],
        'documents' => [
            'admin.documents.certificatetemplates.index',
            'admin.documents.certificates.index',
            'admin.documents.idcards.index',
            'admin.documents.transcripts.index',
            'admin.documents.official.index',
        ],
        'communication' => [
            'admin.communication-center.index',
            'admin.communication.chat.index',
            'admin.communication-notifications.index',
            'admin.communication-calendars.index',
            'admin.communication.cms.index',
            'admin.communication.helpdesk.index',
            'admin.email-logs.index',
            'admin.sms-logs.index',
        ],
        'reports' => [
            'admin.reports.widgets',
            'admin.reports.saved',
            'admin.reports.fees',
            'admin.due_fees',
            'admin.reports.analytics',
        ],
        'workflow' => [
            'admin.workflow-builder.index',
            'admin.workflow-builder.create',
            'admin.workflow-approvals.index',
            'admin.workflow-customfields.index',
        ],
        'biometric' => [
            'admin.biometric-devices.index',
            'admin.biometric-enrolledusers.index',
            'admin.biometric.synclogs',
        ],
        'security' => [
            'admin.security.logins',
            'admin.security.failedlogins',
            'admin.security-devices.index',
            'admin.security.auditlogs',
        ],
        'saas' => [
            'admin.saas.tenants.index',
            'admin.saas.plans.index',
            'admin.saas.apikeys.index',
            'admin.saas.ai.index',
            'admin.saas.backups.index',
            'admin.saas.tasks.index',
            'admin.saas.queue.index',
        ],
        'settings' => [
            'admin.campuses.index',
            'admin.general.index',
            'admin.roles.index',
            'admin.permissions.index',
            'admin.users.index',
            'admin.menu.index',
            'admin.files.index',
            'admin.registry.index',
        ],
    ];

    public function apply(): void
    {
        DB::transaction(function (): void {
            $groups = MenuGroup::query()->orderBy('order')->orderBy('id')->get();
            $this->reorder($groups, self::GROUPS, 'label');

            foreach ($groups as $group) {
                $parents = MenuItem::query()
                    ->where('menu_group_id', $group->id)
                    ->whereNull('parent_id')
                    ->orderBy('order')
                    ->orderBy('id')
                    ->get();

                $this->reorder($parents, self::PARENTS[$group->label] ?? []);

                foreach ($parents as $parent) {
                    $children = MenuItem::query()
                        ->where('parent_id', $parent->id)
                        ->orderBy('order')
                        ->orderBy('id')
                        ->get();

                    $this->reorder($children, self::CHILDREN[$parent->key] ?? []);
                    $parent->updateQuietly(['badge_count' => $children->count() ?: null]);
                }
            }
        });

        Cache::forget('sidebar.navigation');
    }

    /**
     * Preferred records come first; future dynamic records retain their relative order after them.
     *
     * @param Collection<int, MenuGroup|MenuItem> $records
     * @param list<string> $preferred
     */
    private function reorder(Collection $records, array $preferred, string $column = 'key'): void
    {
        $rank = array_flip($preferred);

        $records
            ->sortBy(fn (MenuGroup|MenuItem $record): array => [
                $rank[$record->{$column}] ?? PHP_INT_MAX,
                $record->order,
                $record->id,
            ])
            ->values()
            ->each(fn (MenuGroup|MenuItem $record, int $order) => $record->updateQuietly(['order' => $order]));
    }
}
