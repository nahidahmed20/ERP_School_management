<?php
namespace App\Models;
use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Account extends Model {
    use HasFactory, BelongsToCampus;
    
    protected $fillable = [
        'campus_id', 'name', 'code', 'type', 'opening_balance', 'description', 'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean', 'opening_balance' => 'decimal:2',
    ];

    public function debitEntries() { return $this->hasMany(JournalEntry::class, 'debit_account_id'); }
    public function creditEntries() { return $this->hasMany(JournalEntry::class, 'credit_account_id'); }
    public function campus() { return $this->belongsTo(Campus::class); }
}
