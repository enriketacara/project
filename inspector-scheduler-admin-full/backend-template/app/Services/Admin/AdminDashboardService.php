<?php

namespace App\Services\Admin;

use App\Models\Job;
use App\Models\User;

class AdminDashboardService
{
    public function summary(): array
    {
        $jobs = [
            'offered' => Job::query()->where('status','OFFERED')->count(),
            'claimed' => Job::query()->where('status','CLAIMED')->count(),
            'completed' => Job::query()->where('status','COMPLETED')->count(),
        ];

        $inspectorsTotal = User::query()->where('role','INSPECTOR')->count();

        $byLocation = User::query()
            ->where('role','INSPECTOR')
            ->selectRaw('location, COUNT(*) as total')
            ->groupBy('location')
            ->pluck('total','location')
            ->toArray();

        return [
            'jobs' => $jobs,
            'inspectors' => [
                'total' => $inspectorsTotal,
                'by_location' => $byLocation,
            ],
        ];
    }
}
