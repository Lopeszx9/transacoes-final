<?php

namespace App\Enums;

enum TransactionStatus: string
{
    case EM_PROCESSAMENTO = 'em_processamento';
    case APROVADA = 'aprovada';
    case NEGADA = 'negada';

    
    public function label(): string
    {
        return match ($this) {
            self::EM_PROCESSAMENTO => 'Em processamento',
            self::APROVADA => 'Aprovada',
            self::NEGADA => 'Negada',
        };
    }

   
    public static function values(): array
    {
        return array_map(fn (self $status) => $status->value, self::cases());
    }
}
