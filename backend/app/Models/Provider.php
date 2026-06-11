<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Provider extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'phone', 'address'];

    public function items()
    {
        return $this->hasMany(Item::class);
    }

    public function stockAdditions()
    {
        return $this->hasMany(StockAddition::class);
    }
}
