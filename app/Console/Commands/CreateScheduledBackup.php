<?php
namespace App\Console\Commands;
use App\Jobs\GenerateSecureBackup;use App\Models\SaasBackup;use Illuminate\Console\Command;
class CreateScheduledBackup extends Command{protected$signature='backup:secure {--type=Full Backup}';protected$description='Queue an encrypted, checksummed ERP backup';public function handle():int{$type=$this->option('type');if(!in_array($type,['Database','Files','Full Backup'],true)){$this->error('Invalid backup type.');return self::FAILURE;}$b=SaasBackup::create(['file_name'=>'backup_'.strtolower(str_replace(' ','_',$type)).'_'.now()->format('Y_m_d_His').'.zip','type'=>$type,'status'=>'Pending']);GenerateSecureBackup::dispatch($b->id)->onQueue('backups');$this->info("Backup #{$b->id} queued.");return self::SUCCESS;}}
