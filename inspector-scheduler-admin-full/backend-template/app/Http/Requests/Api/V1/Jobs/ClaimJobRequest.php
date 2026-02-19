<?php

namespace App\Http\Requests\Api\V1\Jobs;

use Illuminate\Foundation\Http\FormRequest;

class ClaimJobRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'scheduled_at_local' => ['required', 'date'],
        ];
    }
}
