<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockAddition extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_id',
        'provider_id',
        'boxes_added',
        'unit_price',
    ];

    public function item()
    {
        return $this->belongsTo(Item::class);
    }

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }
}
