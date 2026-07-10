
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: sans-serif; font-size: 11px; color: #16241C; }
        h2 { color: #1B4332; margin-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { border: 1px solid #DCE3D8; padding: 6px 8px; text-align: left; }
        th { background: #1B4332; color: #fff; }
        tr:nth-child(even) { background: #EEF1EA; }
        .badge { padding: 2px 6px; border-radius: 10px; font-size: 9px; }
        .active { background: #DDEFE3; color: #1B4332; }
        .inactive { background: #F3E1DD; color: #A6342B; }
    </style>
</head>
<body>
    <h2>Verdant School ERP — Menu Items</h2>
    <p>Generated: {{ now()->format('d M Y, h:i A') }}</p>
    <table>
        <thead>
            <tr>
                <th>#</th><th>Group</th><th>Parent</th><th>Key</th><th>Label</th>
                <th>Route</th><th>Badge</th><th>Order</th><th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($items as $i => $item)
            <tr>
                <td>{{ $i + 1 }}</td>
                <td>{{ $item->group->label ?? '—' }}</td>
                <td>{{ $item->parent->label ?? '—' }}</td>
                <td>{{ $item->key }}</td>
                <td>{{ $item->label }}</td>
                <td>{{ $item->route_name ?? '—' }}</td>
                <td>{{ $item->badge_count ?? 0 }}</td>
                <td>{{ $item->order }}</td>
                <td><span class="badge {{ $item->is_active ? 'active' : 'inactive' }}">{{ $item->is_active ? 'Active' : 'Inactive' }}</span></td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
