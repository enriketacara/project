<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ListJobsRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'status' => ['sometimes', Rule::in(['OFFERED','CLAIMED','COMPLETED','ARCHIVED'])],
            'inspector_id' => ['sometimes','integer','min:1'],
            'from' => ['sometimes','date_format:Y-m-d'],
            'to' => ['sometimes','date_format:Y-m-d'],
            'include_archived' => ['sometimes','boolean'],
            'page' => ['sometimes','integer','min:1'],
            'per_page' => ['sometimes','integer','min:1','max:100'],
        ];
    }
}
