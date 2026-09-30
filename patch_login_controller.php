<?php
$file = "app/Http/Controllers/Auth/AuthenticatedSessionController.php";
$content = file_get_contents($file);

$mainHost = "parse_url(config('app.url'), PHP_URL_HOST)";
$currentHost = "\$request->getHost()";

$newProps = "
            'isMainDomain' => $mainHost === $currentHost || $currentHost === '127.0.0.1' || $currentHost === 'localhost',
";

$content = str_replace("'captchaQuestion' => session('captcha_required') ? session('captcha_question') : null,", "'captchaQuestion' => session('captcha_required') ? session('captcha_question') : null," . $newProps, $content);
$content = str_replace("public function create(): Response", "public function create(\Illuminate\Http\Request \$request): Response", $content);

file_put_contents($file, $content);
echo "Patched AuthenticatedSessionController";
