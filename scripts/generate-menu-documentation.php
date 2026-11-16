<?php

declare(strict_types=1);

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Route;

require __DIR__.'/../vendor/autoload.php';

$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

$escape = static fn (mixed $value): string => htmlspecialchars((string) $value, ENT_XML1 | ENT_QUOTES, 'UTF-8');
$seed = file(__DIR__.'/../database/seeders/MenuSeeder.php', FILE_IGNORE_NEW_LINES) ?: [];
$groups = [];
$group = null;
$parent = null;

foreach ($seed as $line) {
    if (preg_match('/\/\/\s*(\d+)\.\s*(.+?)(?:\s*\(|$)/', $line, $match)) {
        $group = trim($match[2]);
        $groups[$group] ??= ['number' => (int) $match[1], 'modules' => []];
        $parent = null;
    }

    if (! $group) continue;
    if (str_contains($line, "'children' => [") && preg_match("/'key'\s*=>\s*'([^']+)'\s*,\s*'label'\s*=>\s*'([^']+)'/", $line, $item)) {
        $entry = ['key' => $item[1], 'label' => $item[2], 'route' => ''];
        $parent = $entry['key'];
        $groups[$group]['modules'][$parent] = $entry + ['children' => []];
    } elseif ($parent && isset($groups[$group]['modules'][$parent]) && preg_match("/'key'\s*=>\s*'([^']+)'\s*,\s*'label'\s*=>\s*'([^']+)'\s*,\s*'route'\s*=>\s*'([^']+)'/", $line, $item)) {
        $entry = ['key' => $item[1], 'label' => $item[2], 'route' => $item[3]];
        $groups[$group]['modules'][$parent]['children'][] = $entry;
    }
}

$routes = [];
foreach (Route::getRoutes() as $route) {
    if ($name = $route->getName()) {
        $routes[$name] = [
            'methods' => implode(', ', array_values(array_diff($route->methods(), ['HEAD']))),
            'uri' => '/'.ltrim($route->uri(), '/'),
            'action' => $route->getActionName(),
            'middleware' => $route->gatherMiddleware(),
        ];
    }
}

$description = static function (string $label, string $module): string {
    $specific = [
        'Dashboard' => 'Live overview, priorities, notifications and selected-campus KPIs.',
        'Academic Sessions' => 'Create and maintain the academic year/session used by enrollment and promotion.',
        'Class Timetable' => 'Create and publish period-wise class routine.',
        'Lesson & Syllabus' => 'Plan lessons, syllabus coverage and teaching progress.',
        'Student Admissions' => 'Register one student with guardian, enrollment and student record.',
        'Online Admissions' => 'Review submitted admission applications and approve/reject them.',
        'Student List' => 'Search, edit, print/export and manage student records.',
        'Parents & Guardians' => 'Maintain guardian contacts, relationships and communication details.',
        'Student & Guardian Hub' => 'Manage pickup persons, consent, contacts and guardian timeline.',
        'Student Documents' => 'Upload and authorize access to student supporting documents.',
        'Promotions' => 'Move eligible students to the next class/section/session.',
        'Student Attendance' => 'Record, correct and review daily student attendance.',
        'Biometric Sync Logs' => 'Review ZKTeco/device synchronization results and exceptions.',
        'Marks Entry' => 'Enter, validate, lock and publish exam marks.',
        'Report Cards' => 'Generate printable/published report cards from approved marks.',
        'Payroll Management' => 'Generate, review and finalize staff salary payroll.',
        'Payroll Attendance Adjustments' => 'Review unpaid absence, leave and overtime effects before payroll finalization.',
        'Payment Gateways' => 'Configure payment providers, inspect transactions and process approved refunds.',
        'Point of Sale (POS)' => 'Create counter sales and payment receipts.',
        'Library Operations' => 'Run issue/return, reservation, fines, stock check and reminders.',
        'Transport Operations' => 'Manage boarding, fuel, GPS, maintenance, route fees and notifications.',
        'Hostel Operations' => 'Manage beds, attendance, visitors, meals, deposits, damage and clearance.',
        'Cafeteria & Wallet POS' => 'Manage wallets, orders, kitchen flow, top-ups, limits and cash closing.',
        'Medical Operations' => 'Manage visits, consent, medicine issue, emergency alerts and vaccination.',
        'Official Document Studio' => 'Create controlled printable official documents, IDs and certificates.',
        'Communication Center' => 'Coordinate audience communications, approvals and delivery monitoring.',
        'Security & Operations' => 'Run security policy, queues, backup, health and audit operations.',
        'SaaS Control Center' => 'Manage tenants, subscriptions, plan usage and cross-campus administration.',
        'General Settings' => 'Maintain campus settings; Super Admin can also set shared school branding and logo.',
        'System Registry & Diagnostics' => 'Review system registry data and diagnostics for administrators.',
    ];
    return $specific[$label] ?? sprintf('Open the %s area to manage %s records and related workflow.', $module, Str::lower($label));
};

$adminScope = static function (array $route): string {
    $middleware = implode(' ', $route['middleware']);
    if (! str_contains($middleware, 'Authenticate')) return 'Public/service endpoint';
    if (str_contains($route['action'], 'StudentPortalController')) return 'Student portal permission';
    if (str_contains($route['action'], 'GuardianPortalController')) return 'Guardian portal permission';
    if (str_contains($middleware, 'EnsureAdminAccess')) return 'Admin permission; campus-scoped where applicable';
    return 'Authenticated user';
};

$paragraph = static function (string $text, string $style = 'Normal', bool $pageBreak = false) use ($escape): string {
    $break = $pageBreak ? '<w:pageBreakBefore/>' : '';
    return '<w:p><w:pPr><w:pStyle w:val="'.$style.'"/>'.$break.'</w:pPr><w:r><w:t xml:space="preserve">'.$escape($text).'</w:t></w:r></w:p>';
};
$cell = static function (string $text, int $width = 2200, bool $header = false) use ($escape): string {
    $style = $header ? '<w:rPr><w:b/></w:rPr>' : '';
    return '<w:tc><w:tcPr><w:tcW w:w="'.$width.'" w:type="dxa"/></w:tcPr><w:p><w:r>'.$style.'<w:t xml:space="preserve">'.$escape($text).'</w:t></w:r></w:p></w:tc>';
};
$table = static function (array $headers, array $rows) use ($cell): string {
    $xml = '<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders><w:top w:val="single" w:sz="6"/><w:left w:val="single" w:sz="6"/><w:bottom w:val="single" w:sz="6"/><w:right w:val="single" w:sz="6"/><w:insideH w:val="single" w:sz="4"/><w:insideV w:val="single" w:sz="4"/></w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="600"/><w:gridCol w:w="1900"/><w:gridCol w:w="2600"/><w:gridCol w:w="1900"/><w:gridCol w:w="3100"/><w:gridCol w:w="1900"/></w:tblGrid>';
    $xml .= '<w:tr>'.implode('', array_map(static fn ($item) => $cell($item, 2200, true), $headers)).'</w:tr>';
    foreach ($rows as $row) $xml .= '<w:tr>'.implode('', array_map(static fn ($item) => $cell((string) $item), $row)).'</w:tr>';
    return $xml.'</w:tbl>';
};

$body = '';
$body .= $paragraph('School ERP', 'Title');
$body .= $paragraph('পূর্ণ Menu, Module ও ব্যবহার নির্দেশিকা', 'Subtitle');
$body .= $paragraph('Generated: '.now()->format('d F Y, h:i A').' | Source: database/seeders/MenuSeeder.php and registered application routes.');
$body .= $paragraph('এই document-টি sidebar-এর serial অনুযায়ী সব menu, submenu, screen route, কাজ এবং access context তালিকাভুক্ত করে।', 'Normal');
$body .= $paragraph('How to use this document', 'Heading1', true);
$body .= $paragraph('1. Super Admin: top bar থেকে Working Campus নির্বাচন করুন। নিজের account campus_id খালি থাকলেও selected campus-এর data create/update হবে।');
$body .= $paragraph('2. Branch Admin: নিজের assigned campus-এই কাজ করবেন; campus বদলানো যাবে না।');
$body .= $paragraph('3. প্রতিটি admin menu role/permission দ্বারা নিয়ন্ত্রিত। কোনো menu না দেখালে Menu Manager ও Roles/Permissions থেকে অনুমতি যাচাই করুন।');
$body .= $paragraph('4. Website logo: Settings & Registry > General Settings > School Logo & Website থেকে Super Admin upload করবেন।');
$body .= $paragraph('5. Student bulk import: Students > Student List থেকে Bulk Import ব্যবহার করুন; template download করে CSV upload করুন।');
$body .= $paragraph('Menu index', 'Heading1');
foreach ($groups as $name => $info) {
    $body .= $paragraph($info['number'].'. '.$name.' — '.count($info['modules']).' main module(s)', 'Normal');
}

$missing = [];
foreach ($groups as $groupName => $groupInfo) {
    $body .= $paragraph($groupInfo['number'].'. '.$groupName, 'Heading1', true);
    $menuNumber = 0;
    foreach ($groupInfo['modules'] as $module) {
        $menuNumber++;
        $body .= $paragraph($groupInfo['number'].'.'.$menuNumber.' '.$module['label'], 'Heading2');
        $body .= $paragraph($description($module['label'], $groupName));
        $rows = [];
        foreach ($module['children'] as $number => $item) {
            $route = $routes[$item['route']] ?? null;
            if (! $route) $missing[] = $item['route'];
            $rows[] = [
                $number + 1,
                $item['label'],
                $item['route'],
                $route ? $route['methods'].' '.$route['uri'] : 'NOT REGISTERED',
                $route ? $description($item['label'], $module['label']) : 'Route requires correction before use.',
                $route ? $adminScope($route) : 'Not available',
            ];
        }
        $body .= $table(['#', 'Menu', 'Route name', 'Method / URL', 'Purpose', 'Access'], $rows ?: [[1, $module['label'], $module['route'], ($routes[$module['route']]['methods'] ?? 'GET').' '.($routes[$module['route']]['uri'] ?? ''), $description($module['label'], $groupName), 'See route']]);
    }
}

$body .= $paragraph('Public website and portal', 'Heading1', true);
$public = [
    ['Public website', 'home', '/', 'School public homepage, campus, academics, teachers, blog, admissions and contact pages.'],
    ['Authentication', 'login', '/login', 'Login, password reset, email verification and two-factor challenge flow.'],
    ['Student portal', 'portal.services', '/student-services', 'Student learning, homework, attendance, fee, library, transport, hostel and service requests.'],
    ['Guardian portal', 'guardian.services', '/guardian-services', 'Guardian access to linked student attendance, fees, results and service information.'],
    ['Biometric device API', 'api.attendance.push', '/api/attendance-push', 'Device attendance synchronization endpoint; configure device URL and secret before production use.'],
    ['Communication webhook', 'webhooks.communications.delivery', '/webhooks/communications/{channel}', 'SMS/email/WhatsApp provider delivery-report endpoint.'],
];
$body .= $table(['Area', 'Route', 'URL', 'Purpose'], $public);

$body .= $paragraph('Operational checklist', 'Heading1', true);
$checks = [
    'Before production: set APP_ENV=production, APP_DEBUG=false, HTTPS, real mail/SMS/payment credentials and provider webhook URLs.',
    'Run queue workers and scheduled tasks continuously; monitor failed jobs and queue dashboard.',
    'Create an encrypted off-site backup and perform a restore drill before go-live.',
    'Use the Working Campus selector before creating campus-bound records. Do not rely on the Main Campus as an implicit default.',
    'Use role permissions rather than sharing Super Admin credentials. Review trusted devices, login history and audit logs periodically.',
];
foreach ($checks as $check) $body .= $paragraph('• '.$check, 'Normal');

$body .= $paragraph('Documentation validation', 'Heading1', true);
$body .= $paragraph('Seeded submenu routes checked: '.array_sum(array_map(static fn ($group) => array_sum(array_map(static fn ($module) => count($module['children']), $group['modules'])), $groups)).'. Missing registered routes at generation: '.(count($missing) ? implode(', ', array_unique($missing)) : 'None.'));
$body .= $paragraph('For deployment details, also read docs/PRODUCTION_DEPLOYMENT.md.');
$body .= '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1000" w:right="900" w:bottom="1000" w:left="900"/></w:sectPr>';

$document = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'.$body.'</w:body></w:document>';
$styles = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos" w:eastAsia="Nirmala UI"/><w:sz w:val="20"/></w:rPr></w:rPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="40"/><w:color w:val="12372A"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/><w:rPr><w:sz w:val="26"/><w:color w:val="475569"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="Heading 1"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="30"/><w:color w:val="12372A"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="Heading 2"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="1E40AF"/></w:rPr></w:style></w:styles>';

$destination = __DIR__.'/../docs/School_ERP_Full_Menu_Documentation.docx';
$archive = new ZipArchive();
if ($archive->open($destination, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) throw new RuntimeException('Cannot create documentation file.');
$archive->addFromString('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>');
$archive->addFromString('_rels/.rels', '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>');
$archive->addFromString('word/_rels/document.xml.rels', '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>');
$archive->addFromString('word/document.xml', $document);
$archive->addFromString('word/styles.xml', $styles);
$archive->addFromString('docProps/core.xml', '<?xml version="1.0" encoding="UTF-8"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>School ERP Full Menu Documentation</dc:title><dc:creator>School ERP</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">'.now()->toAtomString().'</dcterms:created></cp:coreProperties>');
$archive->addFromString('docProps/app.xml', '<?xml version="1.0" encoding="UTF-8"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>School ERP Documentation Generator</Application></Properties>');
$archive->close();

// RTF is a Word-native fallback for hosting environments where downloaded
// OOXML packages are altered by a proxy or file manager.
$rtfEscape = static function (string $value): string {
    $value = str_replace(['\\', '{', '}'], ['\\\\', '\\{', '\\}'], $value);
    return preg_replace('/[^\x20-\x7E\r\n\t]/', '?', $value) ?? $value;
};
$rtf = "{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Aptos;}}\\paperw11906\\paperh16838\\margl900\\margr900\\margt1000\\margb1000\\f0\\fs22\n";
$rtf .= "{\\fs40\\b School ERP}\\par\n{\\fs28 Full Menu, Module and Usage Documentation}\\par\nGenerated: ".now()->format('d F Y, h:i A')."\\par\\par\n";
$rtf .= "This document follows the sidebar serial. Each menu includes its route and purpose.\\par\\par\n";
foreach ($groups as $groupName => $groupInfo) {
    $rtf .= "\\page {\\fs30\\b ".$rtfEscape($groupInfo['number'].'. '.$groupName)."}\\par\n";
    $moduleNumber = 0;
    foreach ($groupInfo['modules'] as $module) {
        $moduleNumber++;
        $rtf .= "{\\fs25\\b ".$rtfEscape($groupInfo['number'].'.'.$moduleNumber.' '.$module['label'])."}\\par\n";
        $rtf .= $rtfEscape($description($module['label'], $groupName))."\\par\n";
        foreach ($module['children'] as $index => $item) {
            $route = $routes[$item['route']] ?? null;
            $line = sprintf('%d. %s | Route: %s | %s | %s', $index + 1, $item['label'], $item['route'], $route ? $route['methods'].' '.$route['uri'] : 'NOT REGISTERED', $description($item['label'], $module['label']));
            $rtf .= $rtfEscape($line)."\\par\n";
        }
        $rtf .= "\\par\n";
    }
}
$rtf .= "\\page {\\fs30\\b Public website and portal}\\par\n";
foreach ($public as $entry) $rtf .= $rtfEscape(implode(' | ', $entry))."\\par\n";
$rtf .= "\\par Seeded submenu routes checked: ".array_sum(array_map(static fn ($group) => array_sum(array_map(static fn ($module) => count($module['children']), $group['modules'])), $groups)).". Missing registered routes: ".(count($missing) ? implode(', ', array_unique($missing)) : 'None').".\\par\n}";
file_put_contents(__DIR__.'/../docs/School_ERP_Full_Menu_Documentation.rtf', $rtf);

echo "Created: {$destination}\n";
echo 'Created: '.__DIR__.'/../docs/School_ERP_Full_Menu_Documentation.rtf'."\n";
echo 'Menu groups: '.count($groups).'; modules: '.array_sum(array_map(static fn ($group) => count($group['modules']), $groups)).'; submenu entries: '.array_sum(array_map(static fn ($group) => array_sum(array_map(static fn ($module) => count($module['children']), $group['modules'])), $groups))."\n";
echo 'Missing seeded routes: '.count($missing)."\n";
