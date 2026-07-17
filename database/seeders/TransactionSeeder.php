<?php

namespace Database\Seeders;

use App\Enums\TransactionStatus;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Seeder;

class TransactionSeeder extends Seeder
{
    
    public function run(): void
    {
        $admin = User::where('email', 'admin@empresa.com')->first();

        if (! $admin) {
            return;
        }

        $exemplos = [
            ['value' => 1500.00, 'cpf' => '11144477735', 'status' => TransactionStatus::APROVADA],
            ['value' => 320.50, 'cpf' => '52998224725', 'status' => TransactionStatus::EM_PROCESSAMENTO],
            ['value' => 89.90, 'cpf' => '11144477735', 'status' => TransactionStatus::NEGADA],
        ];

        foreach ($exemplos as $exemplo) {
            Transaction::create([
                'user_id' => $admin->id,
                'value' => $exemplo['value'],
                'cpf' => $exemplo['cpf'],
                'status' => $exemplo['status'],
            ]);
        }
    }
}
