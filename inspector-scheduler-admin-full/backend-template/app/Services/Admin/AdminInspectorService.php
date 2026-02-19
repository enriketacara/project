<?php

namespace App\Services\Admin;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminInspectorService
{
    public function list(array $filters)
    {
        $q = User::query()->where('role','INSPECTOR');

        if (isset($filters['active'])) $q->where('active', (bool)$filters['active']);
        if (!empty($filters['location'])) $q->where('location', $filters['location']);

        if (!empty($filters['q'])) {
            $needle = trim($filters['q']);
            $q->where(function($qq) use ($needle) {
                $qq->where('name','ilike',"%{$needle}%")
                   ->orWhere('email','ilike',"%{$needle}%");
            });
        }

        $q->withCount(['assignments as claimed_total'])
          ->withCount(['assignments as completed_total' => function($a){
              $a->whereHas('job', fn($j)=>$j->where('status','COMPLETED'));
          }])
          ->withCount(['assignments as active_total' => function($a){
              $a->whereHas('job', fn($j)=>$j->where('status','CLAIMED'));
          }])
          ->withAvg(['assignments as avg_rating' => function($a){
              $a->whereNotNull('assessment_rating')
                ->whereHas('job', fn($j)=>$j->where('status','COMPLETED'));
          }], 'assessment_rating')
          ->orderBy('id','desc');

        $per = (int)($filters['per_page'] ?? 15);
        return $q->paginate($per);
    }

    public function create(array $data): User
    {
        return User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => 'INSPECTOR',
            'active' => $data['active'] ?? true,
            'location' => $data['location'] ?? 'UK',
            'timezone' => $data['timezone'] ?? 'Europe/London',
            'is_admin' => false,
        ]);
    }

    public function update(User $inspector, array $data): User
    {
        if (isset($data['password'])) $data['password'] = Hash::make($data['password']);
        $inspector->fill($data);
        $inspector->save();
        return $inspector->refresh();
    }

    public function deactivate(User $inspector): void
    {
        $inspector->active = false;
        $inspector->save();
    }
}
