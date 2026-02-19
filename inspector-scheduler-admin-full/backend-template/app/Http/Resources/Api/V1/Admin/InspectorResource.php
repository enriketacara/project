<?php

namespace App\Http\Resources\Api\V1\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\User */
class InspectorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role ?? (($this->is_admin ?? false) ? 'ADMIN' : 'INSPECTOR'),
            'active' => (bool)($this->active ?? true),
            'location' => $this->location,
            'timezone' => $this->timezone,
        ];
    }
}
