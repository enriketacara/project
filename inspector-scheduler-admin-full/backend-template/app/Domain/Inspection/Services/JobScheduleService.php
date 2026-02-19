<?php

namespace App\Domain\Inspection\Services;

use App\Domain\Inspection\Enums\JobStatus;
use App\Domain\Inspection\Exceptions\InvalidJobStateException;
use App\Domain\Inspection\Exceptions\JobNotOwnedException;
use App\Domain\Inspection\Support\DateTimeNormalizer;
use App\Models\Job;
use App\Models\User;

final class JobScheduleService
{
    public function reschedule(Job $job, User $inspector, string $scheduledAtLocal): Job
    {
        $job->loadMissing('assignment');

        if ($job->status === JobStatus::COMPLETED->value) {
            throw InvalidJobStateException::alreadyCompleted();
        }
        if ($job->status !== JobStatus::CLAIMED->value || !$job->assignment) {
            throw InvalidJobStateException::notClaimed();
        }
        if ((int)$job->assignment->inspector_id !== (int)$inspector->id) {
            throw new JobNotOwnedException();
        }

        $scheduledUtc = DateTimeNormalizer::localToUtc($scheduledAtLocal, $inspector->timezone);

        $job->assignment->update([
            'scheduled_at_utc' => $scheduledUtc,
        ]);

        return $job->fresh()->load(['assignment.inspector']);
    }
}
