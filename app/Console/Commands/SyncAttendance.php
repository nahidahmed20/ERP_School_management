<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\StaffAttendance;
use Rats\Zkteco\Lib\ZKTeco;
use Carbon\Carbon;

class SyncAttendance extends Command
{
    protected $signature = 'attendance:sync';
    protected $description = 'Fetch attendance logs from ZKTeco Machine';

    public function handle()
    {
        $zk = new ZKTeco('192.168.1.201');

        if ($zk->connect()) {
            $this->info("Device Connected. Fetching logs...");

            $attendanceLogs = $zk->getAttendance();

            foreach ($attendanceLogs as $log) {
                // $log['id']
                $staffId = $log['id'];
                $datetime = Carbon::parse($log['timestamp']);
                $date = $datetime->format('Y-m-d');
                $time = $datetime->format('H:i:s');

                $existingRecord = StaffAttendance::where('staff_id', $staffId)
                                                 ->where('date', $date)
                                                 ->first();

                if (!$existingRecord) {
                    StaffAttendance::create([
                        'staff_id' => $staffId,
                        'date' => $date,
                        'status' => 'present',
                        'in_time' => $time,
                    ]);
                } else {
                    $existingRecord->update([
                        'out_time' => $time
                    ]);
                }
            }

            // $zk->clearAttendance();

            $zk->disconnect();
            $this->info("Attendance synced successfully!");
        } else {
            $this->error("Failed to connect to the device. Check IP and Network.");
        }
    }
}
