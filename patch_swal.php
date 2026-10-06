<?php
$file = "resources/js/Pages/Admin/Communication/Events/Index.jsx";
$content = file_get_contents($file);

$searchButton = <<<EOT
                  onClick={(e) => {
                    e.preventDefault();
                    if(confirm('Are you sure you want to sync Government Holidays? This might take a few seconds.')){
                        router.post(route('admin.communication-calendars.sync-holidays'));
                    }
                  }}
EOT;

$replaceButton = <<<EOT
                  onClick={(e) => {
                    e.preventDefault();
                    Swal.fire({
                      title: 'Sync Holidays?',
                      text: "This will automatically fetch and add Bangladesh Govt holidays for the current year.",
                      icon: 'question',
                      showCancelButton: true,
                      confirmButtonColor: '#059669',
                      cancelButtonColor: '#64748b',
                      confirmButtonText: 'Yes, Sync Now'
                    }).then((result) => {
                      if (result.isConfirmed) {
                        router.post(route('admin.communication-calendars.sync-holidays'));
                      }
                    });
                  }}
EOT;

$content = str_replace($searchButton, $replaceButton, $content);
file_put_contents($file, $content);
echo "Replaced button click with Swal.\n";
