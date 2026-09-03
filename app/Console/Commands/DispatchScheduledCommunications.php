<?php
namespace App\Console\Commands;use App\Models\CommunicationCampaign;use App\Services\CommunicationCampaignService;use Illuminate\Console\Command;
class DispatchScheduledCommunications extends Command{protected $signature='communications:dispatch';protected $description='Queue approved communication campaigns whose schedule is due';public function handle(CommunicationCampaignService $s):int{CommunicationCampaign::where('status','scheduled')->where('scheduled_at','<=',now())->chunkById(50,fn($rows)=>$rows->each(fn($c)=>$s->queue($c)));return self::SUCCESS;}}
