<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Account extends Model {
    use HasFactory;
    
    protected $fillable = [
        'name', 'code', 'type', 'opening_balance', 'description', 'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function debitEntries() { return $this->hasMany(JournalEntry::class, 'debit_account_id'); }
    public function creditEntries() { return $this->hasMany(JournalEntry::class, 'credit_account_id'); }
}
