<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderTracking extends Model
{
    protected $table = 'order_trackings';

    protected $fillable = [
        'order_code',
        'buyer_id',
        'status',
        'seller_id',
        'shipping_address',
        'phone',
        'total_amount',
        'note',
        'items',
    ];

    protected $casts = [
        'items' => 'array',
    ];


    public function buyer()
    {
        return $this->belongsTo(Buyer::class, 'buyer_id');
    }


    public function product()
    {
        return $this->belongsTo(ProductSeller::class, 'product_id', 'id');
    }
    public function seller(){
        return $this->belongsTo(Seller::class,'seller_id');
    }
}
