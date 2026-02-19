<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Job */
class JobResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'title'       => $this->title,
            'description' => $this->description,
            'status'      => $this->status,
            'assignment'  => $this->whenLoaded('assignment', fn () => new JobAssignmentResource($this->assignment)),
            'created_at'  => optional($this->created_at)?->toIso8601String(),
            'updated_at'  => optional($this->updated_at)?->toIso8601String(),
        ];
    }
}
