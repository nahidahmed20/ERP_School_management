<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\StaffAttendance;
use Rats\Zkteco\Lib\ZKTeco;
use Carbon\Carbon;
use App\Models\BiometricDevice;
use App\Services\BiometricAttendanceService;

class SyncAttendance extends Command
{
    protected $signature = 'attendance:sync {--device= : Sync only one registered device ID}';
    protected $description = 'Fetch attendance logs from ZKTeco Machine';

    public function handle(BiometricAttendanceService $service)
    {
        $devices=BiometricDevice::where('sync_mode','pull')->when($this->option('device'),fn($q,$id)=>$q->whereKey($id))->get();
        foreach($devices as $device){$zk=new ZKTeco($device->ip_address,(int)$device->port);try{if(!$zk->connect())throw new \RuntimeException('Connection failed. Check IP, port and LAN/VPN.');$result=$service->ingestMany($device,$zk->getAttendance()?:[]);$this->info("{$device->name}: {$result['ok']} synced, {$result['failed']} failed.");}catch(\Throwable $e){$device->update(['status'=>'Offline','last_error'=>$e->getMessage()]);$this->error("{$device->name}: {$e->getMessage()}");}finally{try{$zk->disconnect();}catch(\Throwable){}}}
        return self::SUCCESS;
    }
}
