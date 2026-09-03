<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
 public function up():void {
  Schema::table('biometric_devices',function(Blueprint $t){$t->string('api_token_hash',64)->nullable();$t->string('sync_mode')->default('pull');$t->unsignedSmallInteger('sync_interval')->default(1);$t->text('last_error')->nullable();});
  Schema::table('biometric_sync_logs',function(Blueprint $t){$t->string('source_uid')->nullable();$t->unique(['device_id','biometric_id','punch_time'],'biometric_punch_unique');});
  Schema::table('staff_attendances',fn(Blueprint $t)=>$t->string('source')->default('manual')->after('staff_id'));
  Schema::table('student_attendances',fn(Blueprint $t)=>$t->string('source')->default('manual')->after('student_id'));
 }
 public function down():void {
  Schema::table('student_attendances',fn(Blueprint $t)=>$t->dropColumn('source'));Schema::table('staff_attendances',fn(Blueprint $t)=>$t->dropColumn('source'));
  Schema::table('biometric_sync_logs',function(Blueprint $t){$t->dropUnique('biometric_punch_unique');$t->dropColumn('source_uid');});
  Schema::table('biometric_devices',fn(Blueprint $t)=>$t->dropColumn(['api_token_hash','sync_mode','sync_interval','last_error']));
 }
};
