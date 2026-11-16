<?php
namespace App\Console\Commands;
use App\Models\BookIssue;use App\Services\SmsService;use Illuminate\Console\Command;
class ProcessLibraryOverdues extends Command{
 protected $signature='library:overdues';protected $description='Calculate daily fines and send overdue reminders';
 public function handle():int{$rate=(float)config('library.daily_fine',10);BookIssue::with(['user','book'])->whereIn('status',['Issued','Overdue'])->whereDate('due_date','<',today())->chunkById(100,function($rows)use($rate){foreach($rows as $i){$days=\Carbon\Carbon::parse($i->due_date)->diffInDays(today());$i->update(['status'=>'Overdue','fine_amount'=>$days*$rate]);if(!$i->last_reminded_at||$i->last_reminded_at->lt(now()->subDays(config('library.reminder_days',2)))){$phone=$i->user?->staff?->phone??$i->user?->student?->phone??null;if($phone)SmsService::send($phone,"Library reminder: {$i->book?->title} is overdue. Current fine BDT {$i->fine_amount}.",['category'=>'library','reference_key'=>'library-reminder:'.$i->id.':'.today()]);$i->update(['last_reminded_at'=>now()]);}}});return self::SUCCESS;}
}
