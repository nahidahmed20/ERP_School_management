<?php
$file = "resources/js/Pages/Admin/Attendance/Index.jsx";
$content = file_get_contents($file);

// Replace the ??? HTML in sweet alert (Send SMS)
$content = preg_replace('/html: `<p.*?<\/p>`,/s', "html: `<p style=\"color: #64748b; font-size: 0.95rem; margin-top: 6px;\">You are about to send absentee SMS to <strong>\${data.selected_students.length}</strong> selected student(s).<br><strong style=\"color: #4f46e5;\">Are you sure?</strong></p>`,", $content);

// Replace the remaining ??? span
$content = preg_replace('/<span className="text-sm font-semibold">\?\?.*?\?<\/span>/s', '<span className="text-sm font-semibold">Today is a Weekend/Holiday. Attendance entry is disabled.</span>', $content);

// Replace the weird character in attendance_source
$content = str_replace("}  {student.attendance_in_time", "} | {student.attendance_in_time", $content);

file_put_contents($file, $content);
echo "Fixed remaining ? text.\n";
