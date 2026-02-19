<?php

namespace App\Services\Admin;

use App\Models\User;
use App\Models\Job;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class AdminInspectorJobsService
{
    public function listJobsForInspector(User $inspector, array $filters): LengthAwarePaginator
    {
        $q = Job::query()
            ->whereHas('assignment', fn($a)=>$a->where('inspector_id', $inspector->id))
            ->with(['assignment.inspector'])
            ->orderBy('id','desc');

        if (!empty($filters['status'])) $q->where('status', $filters['status']);
        if (!empty($filters['from'])) $q->whereDate('updated_at','>=',$filters['from']);
        if (!empty($filters['to'])) $q->whereDate('updated_at','<=',$filters['to']);

        $per = (int)($filters['per_page'] ?? 15);
        return $q->paginate($per);
    }
}
