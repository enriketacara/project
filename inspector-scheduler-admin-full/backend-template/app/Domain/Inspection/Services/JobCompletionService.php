<?php

namespace App\Domain\Inspection\Services;

use App\Domain\Inspection\Enums\JobStatus;
use App\Domain\Inspection\Exceptions\InvalidJobStateException;
use App\Domain\Inspection\Exceptions\JobNotOwnedException;
use App\Models\Job;
use App\Models\User;
use Illuminate\Support\Facades\DB;

final class JobCompletionService
{
    public function complete(Job $job, User $inspector, int $rating, ?string $notes): Job
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

        return DB::transaction(function () use ($job, $rating, $notes) {
            $job->assignment->update([
                'completed_at_utc'  => now()->utc(),
                'assessment_rating' => $rating,
                'assessment_notes'  => $notes,
            ]);

            $job->update(['status' => JobStatus::COMPLETED->value]);

            return $job->fresh()->load(['assignment.inspector']);
        });
    }
}
