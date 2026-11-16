<?php

namespace App\Http\Requests;

use App\Models\MenuItem;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateMenuItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'menu_group_id' => ['required', 'exists:menu_groups,id'],
            'parent_id' => ['nullable', 'exists:menu_items,id'],
            'key' => ['required', 'string', 'max:100', Rule::unique('menu_items', 'key')->ignore($this->menuItem)],
            'label' => ['required', 'string', 'max:150'],
            'icon' => ['nullable', 'string', 'max:50'],
            'route_name' => ['nullable', 'string', 'max:150'],
            'badge_count' => ['nullable', 'integer', 'min:0'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
            'permission' => ['nullable', 'string', 'max:150', 'regex:/^[A-Za-z0-9._-]+$/'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'parent_id' => $this->input('parent_id') ?: null,
            'route_name' => $this->input('route_name') ?: null,
            'permission' => $this->input('permission') ?: null,
            'badge_count' => $this->input('badge_count') === '' ? null : $this->input('badge_count'),
        ]);
    }

    public function after(): array
    {
        return [function (Validator $validator) {
            $menuItem = $this->route('menuItem');

            if ($this->parent_id && ((int) $this->parent_id === (int) $menuItem?->id
                || ! MenuItem::whereKey($this->parent_id)->where('menu_group_id', $this->menu_group_id)->exists())) {
                $validator->errors()->add('parent_id', 'Select a different parent from the same group.');
            }
        }];
    }
}
