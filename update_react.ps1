$file = "resources/js/Pages/Admin/SaaS/Control/Index.jsx"
$content = Get-Content $file -Raw

$content = $content -replace "company_name: '', domain: '', admin_email: '', admin_phone: '', saas_plan_id: '', valid_until: ''", "company_name: '', domain: '', admin_email: '', admin_phone: '', password: '', saas_plan_id: '', valid_until: ''"

$content = $content -replace "\{\['company_name', 'domain', 'admin_email', 'admin_phone'\]\.map\(", "{['company_name', 'domain', 'admin_email', 'admin_phone', 'password'].map("

Set-Content $file $content -Encoding UTF8
