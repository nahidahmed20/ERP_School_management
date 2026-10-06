<?php
$file = "resources/js/Pages/Admin/Communication/Events/Index.jsx";
$content = file_get_contents($file);

$replaceButton = <<<EOT
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if(confirm('Are you sure you want to sync Government Holidays? This might take a few seconds.')){
                        window.location.href = '/communication-calendars/sync-holidays';
                    }
                  }}
                  className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md active:scale-95"
                >
                  <Icon name="calendar" className="w-4 h-4" /> Sync Govt. Holidays
                </button>
                <button
                  onClick={() => { setEditingItem(null); setFormOpen(true); }}
                  className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md active:scale-95"
                >
                  <Icon name="plus" className="w-4 h-4" /> Add Event
                </button>
            </div>
EOT;

$content = preg_replace('/<button[^>]+onClick=\{\(\) => \{ setEditingItem\(null\); setFormOpen\(true\); \}\}[^>]+>[\s\S]*?<\/button>/', $replaceButton, $content);

file_put_contents($file, $content);
echo "Replaced button.\n";
