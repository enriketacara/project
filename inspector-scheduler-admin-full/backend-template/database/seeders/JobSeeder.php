<?php

namespace Database\Seeders;

use App\Domain\Inspection\Enums\JobStatus;
use App\Models\Job;
use Illuminate\Database\Seeder;

class JobSeeder extends Seeder
{
    public function run(): void
    {
        $jobs = [
            ['title' => 'Safety Inspection - Site A', 'description' => 'Check fire exits and alarms.'],
            ['title' => 'Electrical Inspection - Site B', 'description' => 'Inspect electrical panels and wiring.'],
            ['title' => 'Hygiene Inspection - Site C', 'description' => 'Verify cleaning procedures and hygiene compliance.'],
            ['title' => 'Equipment Audit - Warehouse', 'description' => 'Audit equipment list and condition.'],
            ['title' => 'Quality Check - Production', 'description' => 'Sample quality checks and documentation.'],
        ];

        foreach ($jobs as $j) {
            Job::firstOrCreate(['title' => $j['title']], [
                'description' => $j['description'],
                'status' => JobStatus::OFFERED->value,
            ]);
        }
    }
}
