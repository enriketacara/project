<?php

namespace App\Domain\Inspection\Exceptions;

final class InvalidJobStateException extends DomainException
{
    public static function notOffered(): self
    {
        return new self('Job is not in OFFERED state.', 'JOB_NOT_OFFERED', 409);
    }

    public static function notClaimed(): self
    {
        return new self('Job is not in CLAIMED state.', 'JOB_NOT_CLAIMED', 409);
    }

    public static function alreadyCompleted(): self
    {
        return new self('Job is already COMPLETED.', 'JOB_ALREADY_COMPLETED', 409);
    }
}
