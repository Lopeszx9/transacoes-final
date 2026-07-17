<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();

            // Usuário (local) que criou a transação.
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->decimal('value', 14, 2);

            // CPF salvo apenas com dígitos (11 chars), formatação fica por conta do front.
            $table->string('cpf', 11);

            // Caminho do arquivo comprovante dentro do disco "public" (nullable = opcional).
            $table->string('document_path')->nullable();
            $table->string('document_original_name')->nullable();

            $table->string('status')->default('em_processamento');

            $table->timestamps();
            $table->softDeletes();

            $table->index('cpf');
            $table->index('status');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
