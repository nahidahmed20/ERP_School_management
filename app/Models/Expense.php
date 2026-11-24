<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToCampus;

class Expense extends Model {
    use BelongsToCampus;
    protected $guarded = ['id'];

    protected $casts = [
        'amount' => 'decimal:2',
        'expense_date' => 'date',
        'paid_at' => 'datetime',
        'voided_at' => 'datetime',
        'occurrence_date' => 'date',
    ];

    public function expenseAccount() { return $this->belongsTo(Account::class, 'expense_account_id'); }
    public function paymentAccount() { return $this->belongsTo(Account::class, 'payment_account_id'); }
    public function recurringExpense() { return $this->belongsTo(RecurringExpense::class); }
}

