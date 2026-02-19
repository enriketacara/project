<?php

namespace App\Domain\Inspection\Exceptions;

final class JobAlreadyClaimedException extends DomainException
{
    public function __construct()
    {
        parent::__construct('This job has already been claimed.', 'JOB_ALREADY_CLAIMED', 409);
    }
}
