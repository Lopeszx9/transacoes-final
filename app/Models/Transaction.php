<?php

namespace App\Models;

use App\Enums\TransactionStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'value',
        'cpf',
        'document_path',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
            'status' => TransactionStatus::class,
        ];
    }

    /**
     * Usuário que criou a transação.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
