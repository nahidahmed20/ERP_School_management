<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;use App\Models\BiometricDevice;use App\Services\BiometricAttendanceService;use Illuminate\Http\Request;
class BiometricAttendanceController extends Controller {
 public function __invoke(Request $request,BiometricAttendanceService $service){$data=$request->validate(['serial_number'=>'required|string','token'=>'required|string','punches'=>'required|array|max:1000','punches.*.biometric_id'=>'required','punches.*.punch_time'=>'required|date']);$device=BiometricDevice::where('serial_number',$data['serial_number'])->firstOrFail();abort_unless($device->api_token_hash&&hash_equals($device->api_token_hash,hash('sha256',$data['token'])),401,'Invalid device token.');return response()->json(['status'=>'success']+$service->ingestMany($device,$data['punches'])); }
}
