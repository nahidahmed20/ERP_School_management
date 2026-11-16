<?php
$file = "resources/js/Components/Sidebar.jsx";
$content = file_get_contents($file);

$search = <<<'EOF'
    <div className="brand">
      <div className="seal">{site.logo
        ? <img src={site.logo} alt={shortName + ' logo'} className="h-full w-full rounded-xl object-contain" />
        : <span>{shortName.trim().charAt(0).toUpperCase()}</span>}</div>
      <div className="brand-text">
        <div className="name">{shortName}</div>
        <div className="sub">{site.school_tagline || 'School ERP'}</div>
      </div>
    </div>
EOF;

$replace = <<<'EOF'
    <div className="brand">
      <div className="seal">{site.logo
        ? <img src={site.logo} alt={shortName + ' logo'} className="h-full w-full rounded-xl object-contain" />
        : <span>{shortName.trim().charAt(0).toUpperCase()}</span>}</div>
      {!site.logo && (
          <div className="brand-text">
            <div className="name">{shortName}</div>
            <div className="sub">{site.school_tagline || 'School ERP'}</div>
          </div>
      )}
    </div>
EOF;

$newContent = str_replace($search, $replace, $content);
file_put_contents($file, $newContent);
echo "Replaced Logo logic in Sidebar.jsx\n";
