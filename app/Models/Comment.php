<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    protected $fillable =[
        'product_seller_id',
        'buyer_id',
        'parent_id',
        'message',
        'seller_id'
    ];
    public function buyer()
    {
        return $this->belongsTo(Buyer::class);
    }
    public function seller()
    {
        return $this->belongsTo(Seller::class);
    }
    public function replies()
    {
        return $this->hasMany(Comment::class, 'parent_id');
    }
}


 

