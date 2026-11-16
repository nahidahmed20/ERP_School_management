<?php
namespace App\Models;
use App\Traits\BelongsToCampusThrough;
use Illuminate\Database\Eloquent\Model;

class CommunicationDelivery extends Model
{
    use BelongsToCampusThrough;

    protected $guarded = ['id'];
    protected $casts = [
        'delivered_at' => 'datetime',
        'failed_at' => 'datetime'
    ];

    protected function campusOwnershipRelation(): string
    {
        return 'campaign';
    }

    public function campaign()
    {
        return $this->belongsTo(CommunicationCampaign::class, 'communication_campaign_id');
    }
}
