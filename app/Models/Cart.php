<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Buyer;
use App\Models\ProductSeller;

class Cart extends Model

{
    protected $table = 'carts'; 
    protected $fillable =[
        'buyer_id',
        'product_id',
        'quantity',
    ];



    public function buyer(){
        return $this->belongsTo(Buyer::class);
    }
    public function product(){
        return $this->belongsTo(ProductSeller::class,'product_id');
    }
    public function variant() {
    return $this->belongsTo(ProductVariant::class, 'variant_id');
}
}
