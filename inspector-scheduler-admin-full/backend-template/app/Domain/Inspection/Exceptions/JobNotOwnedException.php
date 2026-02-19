<?php

namespace App\Domain\Inspection\Exceptions;

final class JobNotOwnedException extends DomainException
{
    public function __construct()
    {
        parent::__construct('You do not own this job.', 'JOB_NOT_OWNED', 403);
    }
}
