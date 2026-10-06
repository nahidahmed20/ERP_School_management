<?php
$file = "resources/js/Pages/Admin/Attendance/Index.jsx";
$content = file_get_contents($file);

// Replace broken text in Oops
$content = preg_replace('/text: \'.*?\', customClass/s', "text: 'Please select a Class and Date first!', customClass", $content);

// Replace broken text in subtitle
$content = preg_replace('/<p className="text-sm text-slate-500 mt-1">.*?<\/p>/s', '<p className="text-sm text-slate-500 mt-1">Manage daily student attendance, track absent students, and send SMS notifications to guardians.</p>', $content);

// Replace broken text in lock warning
$content = preg_replace('/<span className="text-sm font-semibold">.*?<\/span>/s', '<span className="text-sm font-semibold">This attendance sheet is locked for the selected date. Contact administration to unlock.</span>', $content, 1);

// Replace broken text in holiday warning (second span)
$content = preg_replace('/<span className="text-sm font-semibold">.*?<\/span>/s', '<span className="text-sm font-semibold">Today is marked as a Holiday. Attendance entry is disabled.</span>', $content, 1);

// Replace broken text in sweet alert
$content = preg_replace('/title: \'[^\']+\',\s*text: `.*?`,/s', "title: 'Incomplete Attendance!', \n        text: `You have \${unMarked.length} unmarked student(s). Please mark attendance for all students or use the 'Mark All' button.`,", $content);

// Replace broken text in sweet alert error
$content = preg_replace('/title: \'[^\']+\',\s*html:/s', "title: 'Validation Error!',\n          html:", $content);

// Fix the A ? thing if not fixed
$content = preg_replace('/\{student\.attendance_source\} A. \{student\.attendance_in_time \|\| \'--\'\}.?"\{student\.attendance_out_time \|\| \'--\'\}/s', '{student.attendance_source} | {student.attendance_in_time || \'--\'} - {student.attendance_out_time || \'--\'}', $content);


file_put_contents($file, $content);
echo "Replaced broken text.\n";
