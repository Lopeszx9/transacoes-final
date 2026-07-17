<?php

namespace App\Enums;

enum TransactionStatus: string
{
    case EM_PROCESSAMENTO = 'em_processamento';
    case APROVADA = 'aprovada';
    case NEGADA = 'negada';

    /**
     * Rótulo amigável em português, útil para exibir nas telas.
     */
    public function label(): string
    {
        return match ($this) {
            self::EM_PROCESSAMENTO => 'Em processamento',
            self::APROVADA => 'Aprovada',
            self::NEGADA => 'Negada',
        };
    }

    /**
     * Lista de valores válidos, usada nas regras de validação (in:...).
     */
    public static function values(): array
    {
        return array_map(fn (self $status) => $status->value, self::cases());
    }
}
