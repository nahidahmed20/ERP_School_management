<?php
namespace App\Jobs;
use App\Models\SaasBackup;use App\Services\SecureBackupService;use Illuminate\Contracts\Queue\ShouldQueue;use Illuminate\Foundation\Queue\Queueable;
class GenerateSecureBackup implements ShouldQueue{use Queueable;public int$tries=3;public int$timeout=1800;public function __construct(public int$backupId,public?array$campusIds=null){}public function handle(SecureBackupService$s):void{$b=SaasBackup::findOrFail($this->backupId);try{$s->create($b,$this->campusIds);}catch(\Throwable$e){$b->update(['status'=>'Failed','error_message'=>$e->getMessage()]);throw$e;}}}
