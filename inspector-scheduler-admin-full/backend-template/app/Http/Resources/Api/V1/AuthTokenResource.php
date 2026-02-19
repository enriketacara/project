<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuthTokenResource extends JsonResource
{
    public function __construct(private readonly string $token, private readonly \App\Models\User $user)
    {
        parent::__construct($user);
    }

    public function toArray(Request $request): array
    {
        return [
            'token'      => $this->token,
            'token_type' => 'Bearer',
            'inspector'  => new InspectorResource($this->user),
        ];
    }
}
