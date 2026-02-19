<?php

namespace App\Services\Admin;

use App\Models\Job;
use Illuminate\Support\Carbon;

class AdminJobService
{
    public function list(array $filters)
    {
        $q = Job::query()->with(['assignment.inspector'])->orderBy('id','desc');

        if (!empty($filters['status'])) $q->where('status', $filters['status']);
        if (!empty($filters['inspector_id'])) {
            $q->whereHas('assignment', fn($a)=>$a->where('inspector_id',(int)$filters['inspector_id']));
        }
        if (!empty($filters['from'])) $q->whereDate('created_at','>=',$filters['from']);
        if (!empty($filters['to'])) $q->whereDate('created_at','<=',$filters['to']);

        if (empty($filters['include_archived'])) {
            $q->whereNull('archived_at')->where('status','!=','ARCHIVED');
        }

        $per = (int)($filters['per_page'] ?? 15);
        return $q->paginate($per);
    }

    public function create(array $data): Job
    {
        return Job::create([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'status' => 'OFFERED',
            'archived_at' => null,
        ]);
    }

    public function update(Job $job, array $data): Job
    {
        if ($job->status === 'ARCHIVED') abort(409, 'Job is archived');
        $job->fill($data);
        $job->save();
        return $job->refresh();
    }

    public function archive(Job $job): void
    {
        $job->status = 'ARCHIVED';
        $job->archived_at = Carbon::now();
        $job->save();
    }
}
