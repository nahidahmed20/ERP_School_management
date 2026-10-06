<?php
$file = "resources/js/Pages/Admin/Communication/Events/Index.jsx";
$content = file_get_contents($file);

$search = <<<EOT
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Communication</span>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Calendar &amp; Events</h1>
              <p className="text-sm text-slate-500 mt-1">
EOT;
// Actually, let's just replace the button div part.
// Search for the button:
$searchButton = <<<EOT
            <button
              onClick={() => { setEditingItem(null); setFormOpen(true); }}
              className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md active:scale-95"
            >
              <Icon name="plus" className="w-4 h-4" /> Add Event
            </button>
EOT;

$replaceButton = <<<EOT
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => router.post(route('admin.communication-calendars.sync-holidays'))}
                  className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md active:scale-95"
                >
                  <Icon name="sync" className="w-4 h-4" /> Sync Govt. Holidays
                </button>
                <button
                  onClick={() => { setEditingItem(null); setFormOpen(true); }}
                  className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md active:scale-95"
                >
                  <Icon name="plus" className="w-4 h-4" /> Add Event
                </button>
            </div>
EOT;

$content = str_replace($searchButton, $replaceButton, $content);
file_put_contents($file, $content);
echo "Added Sync button.\n";
