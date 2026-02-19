<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpsertInspectorRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $inspector = $this->route('inspector');
        $id = is_object($inspector) ? $inspector->id : null;

        return [
            'name' => [$this->isMethod('post') ? 'required' : 'sometimes','string','max:255'],
            'email' => [$this->isMethod('post') ? 'required' : 'sometimes','email','max:255', Rule::unique('users','email')->ignore($id)],
            'password' => [$this->isMethod('post') ? 'required' : 'sometimes','string','min:8'],
            'location' => ['sometimes', Rule::in(['UK','MEXICO','INDIA'])],
            'timezone' => ['sometimes','string','max:64'],
            'active' => ['sometimes','boolean'],
        ];
    }
}
