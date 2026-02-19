<?php

namespace App\Domain\Inspection\Enums;

enum Location: string
{
    case UK     = 'UK';
    case MEXICO = 'MEXICO';
    case INDIA  = 'INDIA';

    public function timezone(): string
    {
        return match ($this) {
            self::UK     => 'Europe/London',
            self::MEXICO => 'America/Mexico_City',
            self::INDIA  => 'Asia/Kolkata',
        };
    }
}
