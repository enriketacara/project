<?php

namespace App\Domain\Inspection\Enums;

enum JobStatus: string
{
    case OFFERED   = 'OFFERED';
    case CLAIMED   = 'CLAIMED';
    case COMPLETED = 'COMPLETED';
    case CANCELLED = 'CANCELLED';
}
