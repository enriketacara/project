<?php

namespace App\Domain\Inspection\Services;

use App\Domain\Inspection\Enums\JobStatus;
use App\Domain\Inspection\Exceptions\InvalidJobStateException;
use App\Domain\Inspection\Exceptions\JobAlreadyClaimedException;
use App\Domain\Inspection\Support\DateTimeNormalizer;
use App\Models\Job;
use App\Models\JobAssignment;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

final class JobClaimService
{
    public function claim(Job $job, User $inspector, string $scheduledAtLocal): JobAssignment
    {
        if ($job->status === JobStatus::COMPLETED->value) {
            throw InvalidJobStateException::alreadyCompleted();
        }
        if ($job->status !== JobStatus::OFFERED->value) {
            throw InvalidJobStateException::notOffered();
        }

        $scheduledUtc = DateTimeNormalizer::localToUtc($scheduledAtLocal, $inspector->timezone);

        return DB::transaction(function () use ($job, $inspector, $scheduledUtc) {
            try {
                $assignment = JobAssignment::create([
                    'job_id'          => $job->id,
                    'inspector_id'    => $inspector->id,
                    'scheduled_at_utc'=> $scheduledUtc,
                ]);
            } catch (QueryException $e) {
                // Postgres unique violation => job already claimed
                if (($e->errorInfo[0] ?? null) === '23505') {
                    throw new JobAlreadyClaimedException();
                }
                throw $e;
            }

            $job->update(['status' => JobStatus::CLAIMED->value]);

            return $assignment->load('inspector');
        });
    }
}
