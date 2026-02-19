<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ListInspectorsRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'q' => ['sometimes','string','max:255'],
            'location' => ['sometimes', Rule::in(['UK','MEXICO','INDIA'])],
            'active' => ['sometimes','boolean'],
            'page' => ['sometimes','integer','min:1'],
            'per_page' => ['sometimes','integer','min:1','max:100'],
        ];
    }
}
