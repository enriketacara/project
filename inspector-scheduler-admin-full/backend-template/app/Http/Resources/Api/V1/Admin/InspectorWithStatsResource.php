<?php

namespace App\Http\Resources\Api\V1\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\User */
class InspectorWithStatsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role ?? 'INSPECTOR',
            'active' => (bool)($this->active ?? true),
            'location' => $this->location,
            'timezone' => $this->timezone,
            'stats' => [
                'claimed_total' => (int)($this->claimed_total ?? 0),
                'completed_total' => (int)($this->completed_total ?? 0),
                'active_total' => (int)($this->active_total ?? 0),
                'avg_rating' => $this->avg_rating !== null ? (float)$this->avg_rating : null,
            ],
        ];
    }
}
