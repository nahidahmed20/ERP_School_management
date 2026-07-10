<?php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class MenuItemResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'key'     => $this->key,
            'label'   => $this->label,
            'icon'    => $this->icon,
            'route'   => $this->route_name,
            'count'   => $this->badge_count,
            'children' => $this->whenLoaded('children', fn () =>
                MenuItemResource::collection($this->children)
            ),
        ];
    }
}
