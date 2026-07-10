<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMenuItemRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'menu_group_id' => ['required', 'exists:menu_groups,id'],
            'parent_id'     => ['nullable', 'exists:menu_items,id'],
            'key'           => ['required', 'string', 'max:100', 'unique:menu_items,key'],
            'label'         => ['required', 'string', 'max:150'],
            'icon'          => ['nullable', 'string', 'max:50'],
            'route_name'    => ['nullable', 'string', 'max:150'],
            'badge_count'   => ['nullable', 'integer', 'min:0'],
            'order'         => ['nullable', 'integer', 'min:0'],
            'is_active'     => ['boolean'],
        ];
    }
}
