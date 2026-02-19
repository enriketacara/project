<?php

namespace App\Domain\Inspection\Services;

use App\Models\Job;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class JobQueryService
{
    public function paginate(?string $status, int $perPage = 15): LengthAwarePaginator
    {
        $q = Job::query()->latest('id');

        if ($status) {
            $q->where('status', $status);
        }

        return $q->paginate($perPage);
    }

    public function findWithAssignment(int $jobId): Job
    {
        return Job::query()
            ->with(['assignment.inspector'])
            ->findOrFail($jobId);
    }
}
