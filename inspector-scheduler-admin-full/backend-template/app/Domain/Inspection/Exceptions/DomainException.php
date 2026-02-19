<?php

namespace App\Domain\Inspection\Exceptions;

use RuntimeException;

abstract class DomainException extends RuntimeException
{
    public function __construct(
        public readonly string $publicMessage,
        public readonly string $publicCode,
        public readonly int $httpStatus,
        ?string $debugMessage = null,
    ) {
        parent::__construct($debugMessage ?? $publicMessage);
    }
}
