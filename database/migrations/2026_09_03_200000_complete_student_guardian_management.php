<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
 public function up():void {
  Schema::create('student_guardians',function(Blueprint $t){$t->id();$t->foreignId('student_id')->constrained()->cascadeOnDelete();$t->foreignId('guardian_id')->constrained()->cascadeOnDelete();$t->string('relationship')->default('guardian');$t->boolean('is_primary')->default(false);$t->boolean('can_pickup')->default(true);$t->boolean('receives_sms')->default(true);$t->boolean('receives_email')->default(true);$t->string('custody_note')->nullable();$t->timestamps();$t->unique(['student_id','guardian_id']);});
  Schema::create('student_authorized_pickups',function(Blueprint $t){$t->id();$t->foreignId('student_id')->constrained()->cascadeOnDelete();$t->string('name');$t->string('relationship');$t->string('phone');$t->string('national_id')->nullable();$t->string('photo')->nullable();$t->boolean('is_active')->default(true);$t->date('valid_until')->nullable();$t->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();$t->timestamps();});
  Schema::create('student_guardian_notes',function(Blueprint $t){$t->id();$t->foreignId('student_id')->constrained()->cascadeOnDelete();$t->foreignId('guardian_id')->nullable()->constrained()->nullOnDelete();$t->string('category')->default('general');$t->text('note');$t->boolean('is_confidential')->default(false);$t->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();$t->timestamps();});
  DB::table('students')->whereNotNull('guardian_id')->orderBy('id')->chunkById(500,function($rows){foreach($rows as $row)DB::table('student_guardians')->updateOrInsert(['student_id'=>$row->id,'guardian_id'=>$row->guardian_id],['relationship'=>'primary guardian','is_primary'=>true,'can_pickup'=>true,'receives_sms'=>true,'receives_email'=>true,'created_at'=>now(),'updated_at'=>now()]);});
 }
 public function down():void {Schema::dropIfExists('student_guardian_notes');Schema::dropIfExists('student_authorized_pickups');Schema::dropIfExists('student_guardians');}
};
