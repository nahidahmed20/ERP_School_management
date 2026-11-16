<?php

namespace App\Exports;

use App\Models\MenuItem;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class MenuItemsExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    public function collection()
    {
        return MenuItem::with(['group', 'parent'])->orderBy('menu_group_id')->orderBy('order')->get();
    }

    public function headings(): array
    {
        return ['ID', 'Group', 'Parent', 'Key', 'Label', 'Icon', 'Route', 'Badge Count', 'Order', 'Status'];
    }

    public function map($item): array
    {
        return [
            $item->id,
            $item->group->label ?? '—',
            $item->parent->label ?? '—',
            $item->key,
            $item->label,
            $item->icon ?? '—',
            $item->route_name ?? '—',
            $item->badge_count ?? 0,
            $item->order,
            $item->is_active ? 'Active' : 'Inactive',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [1 => ['font' => ['bold' => true]]];
    }
}
