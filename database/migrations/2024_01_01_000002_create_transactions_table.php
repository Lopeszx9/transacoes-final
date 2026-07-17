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

            
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->decimal('value', 14, 2);

            
            $table->string('cpf', 11);

           
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
