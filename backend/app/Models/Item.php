<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'provider_id',
        'name',
        'description',
        'image_path',
        'boxes_quantity',
        'pieces_per_box',
        'unit_price',
    ];

    public function categories()
    {
        return $this->belongsToMany(Category::class);
    }

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }

    public function invoiceItems()
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function stockAdditions()
    {
        return $this->hasMany(StockAddition::class);
    }
}
