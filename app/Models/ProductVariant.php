<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\ProductSeller;
class ProductVariant extends Model
{
    protected $fillable =[
        'product_seller_id',
        'variant_name',
        'product_cost',
        'product_price',
        'product_stock',
        'product_sku',
        
        'image'


    ];

    public function productSeller ( ){
        return $this->belongsTo(ProductSeller::class,'product_seller_id');
    }
}
