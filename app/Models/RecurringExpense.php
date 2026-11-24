<?php

namespace App\Models;

use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;

class RecurringExpense extends Model
{
    use BelongsToCampus;

    protected $guarded = ['id'];

    protected $casts = [
        'amount' => 'decimal:2',
        'start_date' => 'date',
        'next_due_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
    ];

    public function expenseAccount() { return $this->belongsTo(Account::class, 'expense_account_id'); }
    public function expenses() { return $this->hasMany(Expense::class); }
}
