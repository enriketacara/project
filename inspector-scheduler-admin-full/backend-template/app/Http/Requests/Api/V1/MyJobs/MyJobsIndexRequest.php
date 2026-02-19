<?php

namespace App\Http\Requests\Api\V1\MyJobs;

use Illuminate\Foundation\Http\FormRequest;

class MyJobsIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['nullable', 'in:CLAIMED,COMPLETED'],
            'from'   => ['nullable', 'date'],
            'to'     => ['nullable', 'date'],
        ];
    }
}
