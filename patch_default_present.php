<?php
$file = "resources/js/Pages/Admin/Attendance/Index.jsx";
$content = file_get_contents($file);

$content = str_replace(
    "status: s.attendance_status || '',",
    "status: s.attendance_status || 'present',",
    $content
);

file_put_contents($file, $content);
echo "Set default attendance status to present.\n";
