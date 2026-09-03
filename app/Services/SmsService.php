<?php
namespace App\Services;
use App\Models\SmsLog;use Illuminate\Support\Facades\DB;use Illuminate\Support\Facades\Http;use Illuminate\Support\Facades\Log;
class SmsService {
 public static function send($number,$message,array $meta=[]):bool {
  $number=preg_replace('/[^0-9+]/','',(string)$number);if(!$number)return false;
  if(!empty($meta['reference_key'])&&SmsLog::where('reference_key',$meta['reference_key'])->whereIn('status',['Sent','Success','Simulated'])->exists())return true;
  $driver=config('services.sms.driver','log');$status='Simulated';$providerId=null;$responseText=null;
  try {if($driver==='http'){$response=Http::timeout(15)->retry(2,300)->asForm()->post(config('services.sms.url'),['api_key'=>config('services.sms.api_key'),'senderid'=>config('services.sms.sender_id'),'number'=>$number,'message'=>$message]);$responseText=$response->body();if(!$response->successful())throw new \RuntimeException('SMS gateway returned HTTP '.$response->status());$status='Sent';$providerId=$response->json('message_id');}else Log::info('SMS SIMULATED',['number'=>$number,'message'=>$message]);
   SmsLog::create(['campus_id'=>$meta['campus_id']??null,'recipient_name'=>$meta['recipient_name']??null,'phone_number'=>$number,'message'=>$message,'status'=>$status,'category'=>$meta['category']??'custom','recipient_type'=>$meta['recipient_type']??null,'recipient_id'=>$meta['recipient_id']??null,'reference_key'=>$meta['reference_key']??null,'provider_message_id'=>$providerId,'provider_response'=>$responseText,'sent_at'=>now(),'sent_by'=>$meta['sent_by']??auth()->id()]);self::timeline($meta,$message,$status);return true;
  }catch(\Throwable $e){Log::error('SMS sending failed',['error'=>$e->getMessage()]);SmsLog::create(['phone_number'=>$number,'message'=>$message,'status'=>'Failed','category'=>$meta['category']??'custom','recipient_name'=>$meta['recipient_name']??null,'recipient_type'=>$meta['recipient_type']??null,'recipient_id'=>$meta['recipient_id']??null,'reference_key'=>$meta['reference_key']??null,'provider_response'=>$e->getMessage(),'sent_by'=>$meta['sent_by']??auth()->id()]);self::timeline($meta,$message,'Failed');return false;}
 }
 private static function timeline(array $meta,string $message,string $status):void {if(($meta['recipient_type']??null)!=='guardian'||empty($meta['recipient_id'])||($meta['category']??null)==='verification'||!DB::getSchemaBuilder()->hasTable('guardian_communication_events'))return;DB::table('guardian_communication_events')->insert(['guardian_id'=>$meta['recipient_id'],'student_id'=>$meta['student_id']??null,'channel'=>'sms','direction'=>'outbound','subject'=>ucfirst($meta['category']??'notification'),'content'=>$message,'status'=>strtolower($status),'created_at'=>now(),'updated_at'=>now()]);}
}
