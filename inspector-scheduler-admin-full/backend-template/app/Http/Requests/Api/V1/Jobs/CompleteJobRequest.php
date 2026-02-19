<?php

namespace App\Http\Requests\Api\V1\Jobs;

use Illuminate\Foundation\Http\FormRequest;

class CompleteJobRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'assessment_rating' => ['required', 'integer', 'min:1', 'max:5'],
            'assessment_notes'  => ['nullable', 'string', 'max:5000'],
        ];
    }
}
