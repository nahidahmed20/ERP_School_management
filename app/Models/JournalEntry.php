<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JournalEntry extends Model {
    use HasFactory;
    
    protected $fillable = [
        'voucher_no', 'date', 'voucher_type', 'debit_account_id', 
        'credit_account_id', 'amount', 'description', 'created_by'
    ];

    public function debitAccount() {
        return $this->belongsTo(Account::class, 'debit_account_id');
    }

    public function creditAccount() {
        return $this->belongsTo(Account::class, 'credit_account_id');
    }

    public function creator() {
        return $this->belongsTo(User::class, 'created_by');
    }
}