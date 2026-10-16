<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected  $fillable =[
        'user_id', 
    'product_name',
    'slug',
    'decribtion',
    'price',
    'stock'
    ];
    public function seller()
{
    return $this->belongsTo(Seller::class, 'seller_id', 'id');
}

}


