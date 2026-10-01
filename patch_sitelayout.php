<?php
$file = "resources/js/Layouts/SiteLayout.jsx";
$content = file_get_contents($file);

$search = <<<'EOF'
            {(light ? settings.footer_logo || settings.logo : settings.logo) ? (
                <img
                    src={light ? settings.footer_logo || settings.logo : settings.logo}
                    alt={settings.school_name || "School logo"}
                />
            ) : (
                <i>{initial}</i>
            )}
            <span>
                <b>{settings.school_short_name || settings.school_name}</b>
                <small>{settings.school_tagline}</small>
            </span>
EOF;

$replace = <<<'EOF'
            {(light ? settings.footer_logo || settings.logo : settings.logo) ? (
                <img
                    src={light ? settings.footer_logo || settings.logo : settings.logo}
                    alt={settings.school_name || "School logo"}
                    className="max-h-12 w-auto"
                />
            ) : (
                <>
                    <i>{initial}</i>
                    <span>
                        <b>{settings.school_short_name || settings.school_name}</b>
                        <small>{settings.school_tagline}</small>
                    </span>
                </>
            )}
EOF;

$newContent = str_replace($search, $replace, $content);
file_put_contents($file, $newContent);
echo "Replaced Logo logic in SiteLayout.jsx\n";
