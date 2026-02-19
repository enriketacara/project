<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Domain\Inspection\Support\DateTimeNormalizer;

/** @mixin \App\Models\JobAssignment */
class JobAssignmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $tz = optional($request->user())->timezone ?? 'UTC';

        return [
            'id'                 => $this->id,
            'inspector'          => $this->whenLoaded('inspector', fn () => new InspectorResource($this->inspector)),
            'scheduled_at_utc'   => optional($this->scheduled_at_utc)?->toIso8601String(),
            'scheduled_at_local' => DateTimeNormalizer::utcToLocal(optional($this->scheduled_at_utc)?->toIso8601String(), $tz),
            'completed_at_utc'   => optional($this->completed_at_utc)?->toIso8601String(),
            'completed_at_local' => DateTimeNormalizer::utcToLocal(optional($this->completed_at_utc)?->toIso8601String(), $tz),
            'assessment_rating'  => $this->assessment_rating,
            'assessment_notes'   => $this->assessment_notes,
        ];
    }
}
