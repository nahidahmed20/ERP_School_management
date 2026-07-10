<?php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class MenuGroupResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'label' => $this->label,
            'items' => MenuItemResource::collection($this->whenLoaded('items')),
        ];
    }
}
