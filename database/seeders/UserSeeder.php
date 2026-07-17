<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Usuários já pré-cadastrados no banco, conforme pedido no desafio,
     * para testar a tela de login (email + senha).
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@empresa.com'],
            [
                'name' => 'Administrador',
                'password' => Hash::make('senha123'),
            ]
        );

        User::updateOrCreate(
            ['email' => 'operador@empresa.com'],
            [
                'name' => 'Operador Financeiro',
                'password' => Hash::make('senha123'),
            ]
        );
    }
}
