<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Seller;
class ProductSeller extends Model
{
  use SoftDeletes;
    protected $table = 'product_sellers';
    protected $fillable =[
        'seller_id',
        'product_name',
        'product_description',
        'product_cost',
        'product_price',
        'discount_price',
        'product_stock',
        'product_sku',
        'brand',
        'product_video',
        'brand_image',
        'category_id',
        'image',
        'published_at',
        'status',
        
    ];

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }
    public function seller()
    {
        return $this->belongsTo(Seller::class, 'seller_id','id'); 
    }
    public function variants(){
        return $this->hasMany(ProductVariant::class,'product_seller_id','id');
    }
    public function cart(){
        return $this->hasMany(Cart::class,'product_id');
    }
     public function Order()
{
    return $this->belongsTo(ProductSeller::class, 'order_trackings_id');
}

}
