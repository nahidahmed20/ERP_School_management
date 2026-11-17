$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression

$outputPath = Join-Path (Resolve-Path (Join-Path $PSScriptRoot '..')) 'docs\School_ERP_Project_Guide_Bangla.docx'
$paragraphs = [System.Text.StringBuilder]::new()

function Escape-Xml([string]$Value) {
    return [System.Security.SecurityElement]::Escape($Value)
}

function Add-Paragraph([string]$Text, [string]$Style = 'Normal') {
    $escaped = Escape-Xml $Text
    [void]$paragraphs.Append("<w:p><w:pPr><w:pStyle w:val=`"$Style`"/></w:pPr><w:r><w:t xml:space=`"preserve`">$escaped</w:t></w:r></w:p>")
}

function Add-PageBreak {
    [void]$paragraphs.Append('<w:p><w:r><w:br w:type="page"/></w:r></w:p>')
}

function Add-Heading([string]$Text, [int]$Level = 1) {
    Add-Paragraph $Text "Heading$Level"
}

function Add-Bullet([string]$Text) {
    Add-Paragraph "•  $Text" 'Bullet'
}

function Add-Code([string]$Text) {
    Add-Paragraph $Text 'Code'
}

function Add-Table([string[]]$Headers, [object[]]$Rows) {
    $columnCount = $Headers.Count
    $columnWidth = [int][Math]::Floor(9200 / $columnCount)
    [void]$paragraphs.Append('<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders><w:top w:val="single" w:sz="4" w:color="D7E0DC"/><w:left w:val="single" w:sz="4" w:color="D7E0DC"/><w:bottom w:val="single" w:sz="4" w:color="D7E0DC"/><w:right w:val="single" w:sz="4" w:color="D7E0DC"/><w:insideH w:val="single" w:sz="4" w:color="D7E0DC"/><w:insideV w:val="single" w:sz="4" w:color="D7E0DC"/></w:tblBorders><w:tblCellMar><w:top w:w="90" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="90" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>')
    for ($i = 0; $i -lt $columnCount; $i++) { [void]$paragraphs.Append("<w:gridCol w:w=`"$columnWidth`"/>") }
    [void]$paragraphs.Append('</w:tblGrid>')
    $allRows = @()
    $allRows += ,$Headers
    $allRows += $Rows
    for ($r = 0; $r -lt $allRows.Count; $r++) {
        [void]$paragraphs.Append('<w:tr><w:trPr><w:cantSplit/></w:trPr>')
        for ($c = 0; $c -lt $columnCount; $c++) {
            $value = Escape-Xml ([string]$allRows[$r][$c])
            $fill = if ($r -eq 0) { '0F3830' } elseif ($r % 2 -eq 0) { 'F4F7F5' } else { 'FFFFFF' }
            $color = if ($r -eq 0) { 'FFFFFF' } else { '24322E' }
            $bold = if ($r -eq 0) { '<w:b/>' } else { '' }
            [void]$paragraphs.Append("<w:tc><w:tcPr><w:tcW w:w=`"$columnWidth`" w:type=`"dxa`"/><w:shd w:fill=`"$fill`"/></w:tcPr><w:p><w:pPr><w:pStyle w:val=`"TableText`"/></w:pPr><w:r><w:rPr><w:color w:val=`"$color`"/>$bold</w:rPr><w:t xml:space=`"preserve`">$value</w:t></w:r></w:p></w:tc>")
        }
        [void]$paragraphs.Append('</w:tr>')
    }
    [void]$paragraphs.Append('</w:tbl><w:p/>')
}

# Cover
Add-Paragraph 'SCHOOL ERP' 'Kicker'
Add-Paragraph 'সম্পূর্ণ Project Guide' 'Title'
Add-Paragraph 'কোথা থেকে শুরু করবেন, project-এর কোন অংশ কোথায় আছে, কীভাবে কাজ করবেন এবং কীভাবে নিরাপদে deploy করবেন' 'Subtitle'
Add-Paragraph 'প্রস্তুত করা হয়েছে repository-র বর্তমান source code ও documentation দেখে' 'Normal'
Add-Paragraph 'প্রকল্প: School Management ERP' 'CoverMeta'
Add-Paragraph 'সংস্করণ: ১.০  |  তারিখ: ১৭ নভেম্বর ২০২৬' 'CoverMeta'
Add-Paragraph 'ভাষা: বাংলা  |  পাঠক: নতুন developer, project owner ও system administrator' 'CoverMeta'
Add-PageBreak

Add-Heading 'এই guide কীভাবে ব্যবহার করবেন'
Add-Paragraph 'প্রথমবার project বুঝতে চাইলে অধ্যায় ১ থেকে ৫ পড়ুন। Development শুরু করতে চাইলে অধ্যায় ৬ ও ৭ অনুসরণ করুন। নির্দিষ্ট feature পরিবর্তনের আগে অধ্যায় ৮ ও ৯ দেখুন। Server-এ publish করার আগে অধ্যায় ১২ অবশ্যই পড়ুন।'
Add-Heading 'সূচিপত্র', 2
foreach ($item in @(
    '১. এক নজরে project এবং প্রথমে কী করবেন',
    '২. প্রযুক্তি ও application কীভাবে চলে',
    '৩. Folder ও file map',
    '৪. User, role, permission ও campus context',
    '৫. ERP feature map',
    '৬. Local development শুরু করার নিয়ম',
    '৭. Request থেকে screen পর্যন্ত data flow',
    '৮. কোন কাজ কোন file-এ করবেন',
    '৯. নিরাপদ development checklist',
    '১০. Database, migration ও sample data',
    '১১. Testing এবং সমস্যা খোঁজা',
    '১২. Production ও cPanel deployment',
    '১৩. সাধারণ সমস্যার সমাধান',
    '১৪. নতুন developer-এর শেখার পথ ও glossary'
)) { Add-Bullet $item }

Add-Heading '১. এক নজরে project এবং প্রথমে কী করবেন'
Add-Paragraph 'এটি একটি Laravel-ভিত্তিক School Management ERP। একই application-এ public school website, administrator/staff workspace, student portal এবং parent portal আছে। ERP-তে একাধিক campus-এর data আলাদা রেখে role/permission অনুযায়ী screen ও কাজ নিয়ন্ত্রণ করা হয়।'
Add-Heading 'প্রথম ৩০ মিনিটে করণীয়', 2
Add-Bullet 'README.md Laravel-এর সাধারণ template; project-specific নির্দেশনা বেশি পাওয়া যাবে docs/ ফোল্ডারে।'
Add-Bullet 'প্রথমে docs/CPANEL_DEPLOYMENT.md ও docs/PRODUCTION_DEPLOYMENT.md পড়ে deployment-এর নিয়ম বুঝুন।'
Add-Bullet 'routes/web.php, resources/js/Pages/Admin/ এবং database/seeders/MenuSeeder.php দেখে screen ও navigation-এর কাঠামো ধরুন।'
Add-Bullet 'Local copy-তে .env.example থেকে configuration বুঝুন। বিদ্যমান .env file-এ ব্যক্তিগত key/password থাকতে পারে—কখনো share বা commit করবেন না।'
Add-Bullet 'শুরুতেই public/build/ অথবা vendor/ বদলাবেন না। UI source resources/ এবং PHP source app/ বা routes/ এ পরিবর্তন করুন।'
Add-Paragraph 'Project-এর dashboard শুধু admin-এর নয়: DashboardController user-এর linked profile দেখে admin, student, parent বা staff dashboard render করে। Login-এ account ID/email থেকে portal চিনে নেওয়ার flow-ও আছে.'

Add-Heading '২. প্রযুক্তি ও application কীভাবে চলে'
Add-Table @('স্তর', 'Project-এ ব্যবহৃত প্রযুক্তি', 'মূল কাজ') @(
    ,@('Backend', 'PHP 8.2+, Laravel 12', 'HTTP route, validation, permissions, business logic ও database access'),
    ,@('Frontend', 'React 18, Inertia.js 2', 'Page/component render; প্রতিটি screen resources/js/Pages-এ'),
    ,@('CSS ও build', 'Tailwind CSS, Vite', 'resources/css ও JSX থেকে browser asset build'),
    ,@('Database', 'Laravel migrations; SQLite/MySQL configuration', 'School, campus, student, fee ও অন্যান্য record'),
    ,@('Queue/cache', 'Laravel queue, cache, scheduler', 'SMS/communication, report, backup ও নির্ধারিত কাজ'),
    ,@('Access control', 'Spatie Laravel Permission', 'Role ও permission অনুযায়ী route এবং navigation access'),
    ,@('PDF/Excel', 'DomPDF, Laravel Excel', 'Report, receipt, transcript, export')
)
Add-Paragraph 'সাধারণ browser request: web route → middleware/auth/permission → controller → model/service → Inertia response → React page. Form submit হলে request আবার Laravel-এ যায়; backend validate করে database update করে এবং success/error response ফেরত দেয়।'
Add-Paragraph 'Vite development mode-এ resources/js ও resources/css সরাসরি HMR-এ load হতে পারে। Production-এ public/build/manifest.json-এর hashed assets serve হয়; তাই production release-এ source code-এর সঙ্গে npm run build-এর output-ও deploy করতে হয়।'

Add-Heading '৩. Folder ও file map'
Add-Table @('Path', 'কী থাকে', 'কখন খুলবেন') @(
    ,@('app/Http/Controllers', 'Laravel request handler; Admin, Auth, Site, Portal', 'Page data, save/update, validation flow বুঝতে'),
    ,@('app/Http/Requests', 'Request validation/auth rules', 'Form-এর input rules বা login flow বদলালে'),
    ,@('app/Http/Middleware', 'Auth, active campus, locale, subscription ও permission guard', 'প্রতি request-এর আগে কীভাবে access/context তৈরি হয়'),
    ,@('app/Models', 'Eloquent database models ও relationships', 'কোন record কোন record-এর সঙ্গে যুক্ত বুঝতে'),
    ,@('app/Services', 'Reusable business logic: fees, attendance, learning, SMS, backups', 'একাধিক controller-এ ব্যবহৃত logic যোগ বা পরিবর্তন করতে'),
    ,@('app/Jobs, app/Console', 'Background jobs ও console commands', 'Queue বা scheduled কাজ যোগ করতে'),
    ,@('routes/web.php', 'Public, login, portal ও admin route definitions', 'নতুন page/action-এর URL ও middleware বসাতে'),
    ,@('routes/api.php, routes/console.php', 'API ও scheduled command registration', 'API endpoint বা schedule নির্ধারণে'),
    ,@('resources/js/Pages', 'React screen; Admin, Auth, Portal, Site, Profile', 'Screen UI/interaction পরিবর্তন করতে'),
    ,@('resources/js/Components, Layouts', 'পুনর্ব্যবহারযোগ্য UI ও shared layout', 'Sidebar, Topbar, form control, modal পরিবর্তনে'),
    ,@('resources/css', 'app.css, sidebar.css, select2.css, site.css ইত্যাদি', 'সামগ্রিক styling বা responsive layout-এ'),
    ,@('resources/views', 'Blade shell, PDF ও export template', 'HTML app shell বা PDF layout বদলাতে'),
    ,@('database/migrations', 'Schema change history', 'নতুন column/table যোগ করতে'),
    ,@('database/seeders, factories', 'Initial roles/menu/reference/sample data', 'Local demo data বা initial setup-এ'),
    ,@('config, bootstrap', 'Laravel configuration ও app bootstrap', 'Middleware alias, service, application setup-এ'),
    ,@('lang', 'Language translation data', 'Bangla/English label translation-এ'),
    ,@('public', 'Public static files, service worker, compiled build output', 'Public file বা generated asset deploy-এ'),
    ,@('tests', 'PHP feature tests ও frontend checks', 'Feature behavior regression check-এ'),
    ,@('docs, deploy, scripts', 'Deployment note, deployment helper, build validation', 'Project संचालन ও release-এ')
)
Add-Heading 'বর্তমান ব্যবহার সহজ করার কয়েকটি ব্যবস্থা', 2
Add-Table @('ব্যবস্থা', 'কোথায় দেখবেন') @(
    ,@('Login-এ portal type বাছতে হয় না; account ID/email থেকে user type শনাক্ত হয়', 'resources/js/Pages/Auth/Login.jsx এবং app/Http/Requests/Auth/LoginRequest.php'),
    ,@('Mobile sidebar-এ close button; desktop header থেকে sidebar hide/show', 'resources/js/Components/Sidebar.jsx, Topbar.jsx ও resources/css/app.css'),
    ,@('General Settings-এ school/website sections এক page-এ; Advanced settings শুরুতেই expanded', 'resources/js/Pages/Admin/General/Index.jsx ও General/Partials/WebsiteSettingsForm.jsx'),
    ,@('Portal ও admin layout responsive rules', 'resources/css/app.css ও resources/css/sidebar.css')
)
Add-Heading 'Project entry points', 2
Add-Bullet 'resources/views/app.blade.php: Inertia page shell, viewport metadata, fonts ও Vite entry load.'
Add-Bullet 'resources/js/app.jsx: Inertia React app bootstrap ও Pages glob resolver.'
Add-Bullet 'bootstrap/app.php: route files, middleware alias/order, CSRF exception ও exception reporting.'
Add-Bullet 'vite.config.js: Laravel Vite plugin এবং React plugin configure করে।'

Add-Heading '৪. User, role, permission ও campus context'
Add-Paragraph 'Project-এ login শুধু password যাচাই নয়। Student ID, staff ID, guardian email অথবা user email দিয়ে account শনাক্ত করা হয়; account-এর linked profile/role দেখে dashboard ও portal data render হয়। User-এর account record ও student/staff/guardian profile-এর link ঠিক থাকা জরুরি।'
Add-Table @('Role/user type', 'প্রধান ব্যবহার', 'উদাহরণ') @(
    ,@('Super Admin', 'Shared school setup, all-campus admin operation, SaaS ও security configuration', 'Campus switch, shared website branding'),
    ,@('Branch/Tenant Admin', 'নিজস্ব branch/tenant-এর operational administration', 'নিজ campus-এর students, fees, attendance'),
    ,@('Staff/Teacher', 'নিজের permission অনুযায়ী admin module বা staff portal', 'Class routine, staff leave, attendance'),
    ,@('Student', 'নিজের academic/service information', 'Homework, attendance, fees, result'),
    ,@('Parent/Guardian', 'শুধু guardian-এর সঙ্গে linked সন্তানদের তথ্য', 'Attendance, homework, published result, fee')
)
Add-Heading 'Campus boundary কীভাবে রক্ষা হয়', 2
Add-Bullet 'SetActiveCampus middleware authenticated user/session থেকে active campus context স্থাপন করে।'
Add-Bullet 'app/Traits/BelongsToCampus.php ও campus-aware query/service model-এ record scope করতে সাহায্য করে।'
Add-Bullet 'EnsureAdminAccess middleware permission check-এর পাশাপাশি write request-এ working campus প্রয়োগ করে।'
Add-Bullet 'Super Admin-এর campus switch privilege আছে; অন্য user সাধারণত নিজের assigned campus-এ সীমাবদ্ধ।'
Add-Bullet 'নতুন query বা endpoint বানালে request-এর campus_id-কে বিশ্বাস করে access দেবেন না। Auth user-এর permission ও linked campus দিয়ে server-side ownership যাচাই করুন।'
Add-Paragraph 'Navigation database menu-ভিত্তিক। MenuSeeder/MenuOrderSeeder ও NavigationService route/permission দেখে menu তৈরি করে। Menu-তে link লুকানো security-এর বিকল্প নয়—route/controller middleware-এও access control থাকতে হবে।'

Add-Heading '৫. ERP feature map'
Add-Table @('Menu group', 'এখানে কী করা হয়') @(
    ,@('Overview', 'Dashboard, security/operations, reports/administration, SaaS control'),
    ,@('Front Office', 'Admission inquiry, visitor book, call log, postal record, notice board'),
    ,@('Academics', 'Session, class, section, subject, classroom, timetable, lesson/syllabus, student, attendance, exams, marks'),
    ,@('Learning', 'LMS course/lesson, homework, question bank/paper, assigned questions, online exam, quiz attempt'),
    ,@('People', 'Recruitment, staff directory, department/designation, attendance, leave, payroll, loan, appraisal, alumni'),
    ,@('Finance', 'Chart of accounts, fees, invoices, payment, voucher, ledger, reports, gateways, refund, inventory, purchase, sales/POS'),
    ,@('Campus Life', 'Library, transport, hostel, cafeteria ও meal payments'),
    ,@('Documents & Certificates', 'ID card, certificate template, generated certificate ও official documents'),
    ,@('Communication', 'Campaign, notification, chat, website CMS/events/calendar ও delivery log'),
    ,@('System', 'Campus, users, roles/permissions, menu manager, settings, translation, files, logs, security, SaaS')
)
Add-Heading 'Public site', 2
Add-Paragraph 'resources/js/Pages/Site ও SiteLayout.jsx-এ Home, Campuses, Academics, Admissions, Contact, Teachers, Careers ও Blog-এর public page রয়েছে। Content এবং logo/color settings WebsiteSettingsService/General Settings থেকে আসে।'
Add-Heading 'Student/Parent/Staff portal', 2
Add-Paragraph 'resources/js/Pages/Portal-এ dashboard, student service, parent service, staff service, results ও online exam screen রয়েছে। Parent শুধু linked children দেখতে পারে; published result ও permission-নিয়ন্ত্রিত document route server-এও যাচাই হয়।'
Add-Paragraph 'Parent dashboard/service center-এ homework, attendance, routine, exams, learning materials, invoice/payment, published results, library/transport/hostel, request/consent/communication information আছে—তবে school event calendar parent page-এ আলাদা feed নেই। আলাদা public event view প্রয়োজন হলে feature হিসেবে route/controller/UI সংযুক্ত করুন.'

Add-Heading '৬. Local development শুরু করার নিয়ম'
Add-Paragraph 'Windows-এ XAMPP/PHP, Composer, Node.js ও npm ব্যবহার করা যায়। PHP version 8.2 বা তার বেশি হতে হবে। XAMPP install করা থাকলে php.exe PATH-এ আছে কি না যাচাই করুন।'
Add-Heading 'প্রথমবার setup', 2
Add-Code 'composer install'
Add-Paragraph 'Project root-এ .env না থাকলে তবেই নিচের copy command চালান। আগে থেকে .env থাকলে সেটি overwrite করবেন না।'
Add-Code 'if (!(Test-Path .env)) { Copy-Item .env.example .env }'
Add-Code 'php artisan key:generate'
Add-Paragraph 'তারপর .env-এ DB_CONNECTION ও database credential configure করুন। .env.example-এ SQLite default দেখানো আছে। SQLite নিলে database/database.sqlite file আছে কি না যাচাই করুন; MySQL নিলে local MySQL service চালু করে database তৈরি ও DB_HOST/DB_DATABASE/DB_USERNAME/DB_PASSWORD বসান।'
Add-Code 'php artisan migrate'
Add-Code 'npm ci'
Add-Paragraph 'Development-এ পৃথক terminal ব্যবহার করতে পারেন:'
Add-Code 'Terminal 1: php artisan serve'
Add-Code 'Terminal 2: npm run dev'
Add-Paragraph 'Laravel + queue listener + log viewer + Vite একসঙ্গে চালাতে composer.json-এর dev script আছে:'
Add-Code 'composer run dev'
Add-Paragraph 'এটি concurrently process চালায়; কোনো process বন্ধ হলে বাকিগুলোকেও বন্ধ করতে পারে। Local run-এ database connection ঠিক না থাকলে Laravel session/cache/queue error দেখা দিতে পারে। প্রয়োজন হলে .env-এ SESSION_DRIVER, CACHE_STORE, QUEUE_CONNECTION সাময়িকভাবে local-supported driver-এ সেট করুন; production-এ স্থায়ীভাবে পরিবর্তনের আগে architecture বুঝুন।'
Add-Heading 'Browser-এ শুরু করুন', 2
Add-Bullet 'Terminal-এর php artisan serve URL (সাধারণত http://127.0.0.1:8000) খুলুন।'
Add-Bullet 'Public home page থেকে login page-এ যান; Super Admin/admin, staff, student বা parent account ব্যবহারের জন্য user/profile link ও role আগে database-এ থাকতে হবে।'
Add-Bullet 'Database fresh হলে seeder চালানোর আগে database/seeders/SchoolLoginAndDemoStudentsSeeder.php ও DatabaseSeeder.php পড়ে নিন। Demo user/password কেবল isolated local database-এ ব্যবহার করুন।'
Add-Bullet 'Production database-এ db:seed চালাবেন না—project deployment note-এ demo/default credential নিয়ে স্পষ্ট নিষেধ আছে।'

Add-Heading '৭. Request থেকে screen পর্যন্ত data flow'
Add-Table @('ধাপ', 'উদাহরণ', 'আপনি কী খুঁজবেন') @(
    ,@('১. Route', 'GET /admin/students → named route', 'routes/web.php-তে URL, controller, middleware'),
    ,@('২. Middleware', 'auth, admin.access, permission', 'bootstrap/app.php alias; app/Http/Middleware'),
    ,@('৩. Controller', 'StudentController@index', 'app/Http/Controllers/Admin-এ query ও action'),
    ,@('৪. Model/Service', 'Student, Enrollment, StudentLearningService', 'app/Models ও app/Services-এ relation/business logic'),
    ,@('৫. Inertia response', 'Inertia::render("Admin/Students/Index", props)', 'controller থেকে page name ও props'),
    ,@('৬. React page', 'resources/js/Pages/Admin/Students/Index.jsx', 'UI, form state, table, modal ও submit action'),
    ,@('৭. Save', 'router.post / useForm.post', 'route validation, store/update controller, model persistence')
)
Add-Paragraph 'Route-এর Inertia component name resources/js/Pages-এর path-এর সঙ্গে মিলতে হয়। Ziggy-র route() named route ব্যবহার করে; URL string hard-code না করে named route ব্যবহার করা ভালো।'

Add-Heading '৮. কোন কাজ কোন file-এ করবেন'
Add-Table @('আপনার কাজ', 'সাধারণত পরিবর্তন করবেন', 'ভুল জায়গা এড়ান') @(
    ,@('একটি screen layout/label', 'resources/js/Pages/... JSX', 'public/build/assets/*.js'),
    ,@('Shared button/sidebar/topbar/modal', 'resources/js/Components বা Layouts', 'একই component-এর copy-পaste variants'),
    ,@('CSS/responsive', 'resources/css/app.css, sidebar.css বা feature stylesheet', 'Hashed production CSS'),
    ,@('URL বা permission', 'routes/web.php + middleware/controller', 'শুধু UI-তে menu hide'),
    ,@('New field/table', 'database/migrations + Model + FormRequest/controller', 'পুরোনো migration edit করে deployed schema বদলানো'),
    ,@('Shared logic', 'app/Services; controller thin রাখুন', 'একাধিক controller-এ একই business calculation copy করা'),
    ,@('Menu item', 'MenuSeeder/feature seeder + role permissions + route', 'শুধু Sidebar.jsx-এ menu hard-code করা'),
    ,@('PDF/receipt/report', 'resources/views/pdf বা app/Exports + controller', 'PDF content React screen-এ ধরেই আছে ভাবা'),
    ,@('Translation', 'lang/ ও project-এর localization flow', 'একটি language key hard-code করে সব locale ভাঙা'),
    ,@('Deployment', 'docs/, deploy/, scripts/; build artifact প্রয়োজনমতো generate', '.env বা production secret commit করা')
)
Add-Heading 'একটি নতুন feature করার প্রস্তাবিত sequence', 2
foreach ($item in @(
    'কোন user/role/campus এই feature ব্যবহার করবে লিখে নিন।',
    'Existing route, controller, model, service ও page pattern খুঁজে একই convention অনুসরণ করুন।',
    'Schema দরকার হলে নতুন migration লিখুন; nullable/default/backfill ও rollback ভাবুন।',
    'Server-side validation এবং authorization দিন; শুধু button disable/hidden যথেষ্ট নয়।',
    'Controller থেকে minimal, permission-checked props পাঠান; বড় logic service-এ রাখুন।',
    'React page-এ loading, empty state, validation error ও success state দেখান।',
    'Navigation dynamic হলে menu/permission seeder ও menu route contract update করুন।',
    'Tests লিখুন/চালান, npm build যাচাই করুন, এরপর review করে deploy করুন।'
)) { Add-Bullet $item }

Add-Heading '৯. নিরাপদ development checklist'
Add-Bullet 'Campus data boundary: query সবসময় নির্দিষ্ট student/guardian/campus-এর linked record-এ সীমাবদ্ধ কিনা যাচাই করুন। Parent/student ID client input থেকে সরাসরি বিশ্বাস করবেন না।'
Add-Bullet 'Authorization: route middleware, policy/permission, controller ownership check—যে স্তরে প্রয়োজন সেখানে যোগ করুন।'
Add-Bullet 'Validation: numeric ID, file type/size, date range, URL, amount ও status server-side validate করুন।'
Add-Bullet 'File access: private document public URL দিয়ে খুলে দেবেন না; SecureFileController-এর মতো authenticated/ownership checked download route অনুসরণ করুন।'
Add-Bullet 'Secrets: .env, API key, payment/SMS password, push key commit বা chat-এ দেবেন না। .env.example-এ placeholder রাখুন।'
Add-Bullet 'Sensitive payment, refund, payroll, marks, guardian data-তে audit/access test করুন।'
Add-Bullet 'Database migration আগে backup এবং staging deploy করুন। Migration irreversible হলে forward-only recovery plan লিখুন।'
Add-Bullet 'System/technical setting key বদলালে WebsiteSettingsService/config cache ও dependent feature test করুন।'

Add-Heading '১০. Database, migration ও sample data'
Add-Paragraph 'database/migrations হলো schema-এর version history; সব environment-এ একই structure আনতে migration ব্যবহার করুন। app/Models-এ Eloquent relation এবং campus scope/trait দেখা যাবে। database/seeders roles, permissions, menu, language/reference/demo data তৈরি করে।'
Add-Code 'php artisan migrate              # নতুন migration প্রয়োগ'
Add-Code 'php artisan migrate:status      # migration অবস্থা'
Add-Code 'php artisan make:migration add_example_to_students_table'
Add-Code 'php artisan make:model Example -m'
Add-Paragraph 'Production-এ migrate --force deploy নির্দেশনা অনুযায়ী চালানো হয়; তার আগে backup বাধ্যতামূলক। migrate:fresh সব table মুছে ফেলে—production-এ কখনো চালাবেন না। db:seed demo user/password যোগ করতে পারে; production-এ চালাবেন না।'

Add-Heading '১১. Testing এবং সমস্যা খোঁজা'
Add-Paragraph 'Project-এ Laravel Feature test ও কিছু frontend-oriented test/script আছে। নতুন behavior-এর জন্য permission, campus boundary, validation ও success/failure case লিখুন।'
Add-Code 'php artisan test'
Add-Code 'npm run build'
Add-Paragraph 'Frontend syntax/asset issue ধরতে production build প্রয়োজন। npm run build script stale Vite hot-file মুছে assets build ও manifest verify করে; local dev server চালু থাকলে আগে সেটি বন্ধ হয়েছে কি না নিশ্চিত করুন।'
Add-Heading 'প্রতিটি পরিবর্তনের পরে সংক্ষিপ্ত যাচাই', 2
Add-Bullet 'সঠিক user role-এ login করে feature দেখা ও ব্যবহার করা যায়।'
Add-Bullet 'অন্য campus/user-এর record URL বদলে access করা যায় না।'
Add-Bullet 'Desktop ও mobile width-এ form/table/modal overflow হয় না।'
Add-Bullet 'Validation error, empty result, success notification এবং unauthorized access ঠিক আছে।'
Add-Bullet 'Migration নতুন database-এ চলে এবং পুরোনো data নষ্ট করে না।'

Add-Heading '১২. Production ও cPanel deployment'
Add-Paragraph 'পূর্ণ deployment note: docs/CPANEL_DEPLOYMENT.md এবং docs/PRODUCTION_DEPLOYMENT.md। নিচের ধাপগুলো overview; server layout ও hosting path অনুযায়ী official project note অনুসরণ করুন।'
Add-Heading 'Release-এর আগে', 2
Add-Bullet 'Production data/file backup নিন এবং staging-এ migration পরীক্ষা করুন।'
Add-Bullet 'APP_ENV=production, APP_DEBUG=false, HTTPS APP_URL, real database, mail, SMS, push ও payment credentials configure করুন। Production .env local থেকে copy করবেন না। Existing production APP_KEY বদলাবেন না।'
Add-Bullet 'npm ci ও npm run build চালান; generated public/build/manifest.json এবং referenced hashed asset deploy হয়েছে যাচাই করুন।'
Add-Bullet 'Domain document root আদর্শভাবে Laravel public/ directory; project-root .htaccess mode হলে root .htaccess/deployment note মিলিয়ে নিন।'
Add-Bullet 'vendor, production .env, storage ও server-generated database/backup file সরিয়ে ফেলবেন না। storage/ ও bootstrap/cache/ web process-এর জন্য writable হতে হবে।'
Add-Heading 'Deploy ও runtime', 2
Add-Code 'php artisan app:production-check'
Add-Code 'php artisan migrate --force'
Add-Code 'php artisan optimize:clear'
Add-Code 'php artisan optimize'
Add-Code 'php artisan schedule:list'
Add-Paragraph 'Production-এ queue worker Supervisor/systemd-তে চালাতে হবে এবং scheduler প্রতি মিনিটে চালাতে cron/task scheduler configure করতে হবে। Project note-এ default, communications, reports, backups queue-এর worker command, দৈনিক 01:30 encrypted backup ও S3 off-site configuration বর্ণিত আছে। Queue failure/security alert monitor করুন।'
Add-Paragraph 'cPanel-এ PHP 8.2+, HTTPS, correct document root, single PHP handler, writable storage/cache এবং public/hot নেই—এসব যাচাই করুন। Deploy শেষে app:production-check pass না করলে traffic-এ release দেবেন না।'

Add-Heading '১৩. সাধারণ সমস্যার সমাধান'
Add-Table @('সমস্যা', 'প্রথমে যাচাই করুন') @(
    ,@('Login-এর পর permission denied', 'User role/permission seeded কিনা, route permission name এবং dynamic menu permission মিলছে কিনা'),
    ,@('Campus select বা save error', 'User assigned campus, active campus/session, SetActiveCampus middleware ও write route scope'),
    ,@('Page খালি / Inertia component not found', 'Inertia::render component name ও resources/js/Pages path/case'),
    ,@('Frontend পরিবর্তন দেখা যাচ্ছে না', 'Dev-এ Vite dev server/hot marker; production-এ manifest, hashed asset, document root, browser/CDN cache'),
    ,@('419 Page Expired', 'Session cookie/domain/HTTPS, SESSION_DRIVER table/migration ও CSRF form/Inertia request'),
    ,@('File upload/download ব্যর্থ', 'Disk/symlink/storage permissions, validation size, secure file route ownership'),
    ,@('Queue notification যায় না', 'QUEUE_CONNECTION, queue worker, retries/failed jobs, SMS/PUSH driver ও provider credentials'),
    ,@('Migration/database connection error', '.env DB_*, database service/file, credentials, extension ও migration status'),
    ,@('cPanel 404 বা asset 404', 'Document root public/ বনাম project root, rewrite rule, manifest-এর asset file deployed কিনা')
)

Add-Heading '১৪. নতুন developer-এর শেখার পথ ও glossary'
Add-Heading 'প্রথম সপ্তাহের learning path', 2
foreach ($item in @(
    'দিন ১: composer.json/package.json, bootstrap/app.php, routes/web.php ও Inertia bootstrap পড়ুন।',
    'দিন ২: DashboardController, Dashboard.jsx, AuthenticatedLayout, Sidebar ও NavigationService trace করুন।',
    'দিন ৩: Students, Attendance বা Fees-এর একটি feature route থেকে UI পর্যন্ত trace করুন।',
    'দিন ৪: সংশ্লিষ্ট migration, model relation, service ও campus/permission check পড়ুন।',
    'দিন ৫: ছোট label/UI fix করুন, test/build চালান, code review ও docs update করুন।'
)) { Add-Bullet $item }
Add-Table @('শব্দ', 'সহজ অর্থ') @(
    ,@('Route', 'কোন URL-এ কোন action চলবে তার map'),
    ,@('Controller', 'Request গ্রহণ করে data/action পরিচালনা করে'),
    ,@('Model', 'Database record ও relation-এর PHP representation'),
    ,@('Migration', 'Database structure পরিবর্তনের versioned script'),
    ,@('Seeder', 'Initial reference/role/menu বা sample data যোগ করার script'),
    ,@('Middleware', 'Controller-এর আগে login, permission, campus, locale যাচাই'),
    ,@('Inertia', 'Laravel route/controller-এর সঙ্গে React page যুক্ত করার adapter'),
    ,@('Vite manifest', 'Production HTML-এ কোন hashed CSS/JS file load হবে তার map'),
    ,@('Queue', 'দীর্ঘ কাজ request-এর বাইরে background-এ চালানো'),
    ,@('Active campus', 'এক request/session-এ কাজের নির্বাচিত campus context')
)
Add-Paragraph 'কাজ শুরু করার সবচেয়ে নিরাপদ নিয়ম: আগে existing flow খুঁজুন → ছোট change করুন → permission/campus boundary যাচাই করুন → tests/build চালান → তারপর release করুন। Project-specific release command, secrets ও backup policy docs/ ফোল্ডারের deployment note-এ সর্বশেষ মিলিয়ে নিন।'
Add-Paragraph 'এই guide repository-তে দেখা source/documentation ধরে তৈরি। Menu, route ও implementation পরিবর্তিত হলে guide-টিও update করুন।'

$styles = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
 <w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Nirmala UI" w:hAnsi="Nirmala UI" w:eastAsia="Nirmala UI" w:cs="Nirmala UI"/><w:lang w:val="bn-BD" w:eastAsia="bn-BD"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="300" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>
 <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:sz w:val="22"/><w:color w:val="24322E"/></w:rPr></w:style>
 <w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:pPr><w:jc w:val="center"/><w:spacing w:before="3000" w:after="360"/></w:pPr><w:rPr><w:b/><w:sz w:val="52"/><w:color w:val="0F3830"/></w:rPr></w:style>
 <w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:pPr><w:jc w:val="center"/><w:spacing w:after="500"/></w:pPr><w:rPr><w:sz w:val="26"/><w:color w:val="52625C"/></w:rPr></w:style>
 <w:style w:type="paragraph" w:styleId="Kicker"><w:name w:val="Kicker"/><w:pPr><w:jc w:val="center"/><w:spacing w:before="1000" w:after="200"/></w:pPr><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="D86E4A"/></w:rPr></w:style>
 <w:style w:type="paragraph" w:styleId="CoverMeta"><w:name w:val="Cover Meta"/><w:pPr><w:jc w:val="center"/><w:spacing w:before="120" w:after="120"/></w:pPr><w:rPr><w:sz w:val="22"/><w:color w:val="52625C"/></w:rPr></w:style>
 <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="360" w:after="180"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:sz w:val="34"/><w:color w:val="0F3830"/></w:rPr></w:style>
 <w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="240" w:after="120"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:sz w:val="27"/><w:color w:val="1C5347"/></w:rPr></w:style>
 <w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="180" w:after="100"/><w:outlineLvl w:val="2"/></w:pPr><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="1C5347"/></w:rPr></w:style>
 <w:style w:type="paragraph" w:styleId="Bullet"><w:name w:val="Bullet"/><w:basedOn w:val="Normal"/><w:pPr><w:ind w:left="360" w:hanging="180"/><w:spacing w:after="100"/></w:pPr></w:style>
 <w:style w:type="paragraph" w:styleId="Code"><w:name w:val="Code"/><w:basedOn w:val="Normal"/><w:pPr><w:ind w:left="200"/><w:spacing w:before="80" w:after="100"/><w:shd w:fill="F1F4F2"/></w:pPr><w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:sz w:val="19"/><w:color w:val="183B32"/></w:rPr></w:style>
 <w:style w:type="paragraph" w:styleId="TableText"><w:name w:val="Table Text"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="30" w:line="260" w:lineRule="auto"/></w:pPr><w:rPr><w:sz w:val="19"/></w:rPr></w:style>
</w:styles>
'@

$document = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>$($paragraphs.ToString())<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="900" w:right="900" w:bottom="900" w:left="900" w:header="450" w:footer="450" w:gutter="0"/></w:sectPr></w:body></w:document>
"@

$contentTypes = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>
'@
$rootRels = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>
'@
$docRels = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>
'@
$core = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>School ERP সম্পূর্ণ Project Guide</dc:title><dc:subject>Project structure, development ও deployment guide</dc:subject><dc:creator>School ERP Project Team</dc:creator><dc:language>bn-BD</dc:language><cp:revision>1</cp:revision></cp:coreProperties>
'@
$app = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>Microsoft Word</Application><AppVersion>16.0000</AppVersion></Properties>
'@

$tempPath = "$outputPath.tmp"
if (Test-Path -LiteralPath $tempPath) { Remove-Item -LiteralPath $tempPath -Force }
$archive = [System.IO.Compression.ZipFile]::Open($tempPath, [System.IO.Compression.ZipArchiveMode]::Create)
try {
    $entries = @{
        '[Content_Types].xml' = $contentTypes
        '_rels/.rels' = $rootRels
        'word/document.xml' = $document
        'word/styles.xml' = $styles
        'word/_rels/document.xml.rels' = $docRels
        'docProps/core.xml' = $core
        'docProps/app.xml' = $app
    }
    foreach ($name in $entries.Keys) {
        $entry = $archive.CreateEntry($name, [System.IO.Compression.CompressionLevel]::Optimal)
        $stream = $entry.Open()
        try {
            $bytes = [System.Text.UTF8Encoding]::new($false).GetBytes([string]$entries[$name])
            $stream.Write($bytes, 0, $bytes.Length)
        } finally { $stream.Dispose() }
    }
} finally { $archive.Dispose() }
Move-Item -LiteralPath $tempPath -Destination $outputPath -Force
Write-Output "Created $outputPath"
