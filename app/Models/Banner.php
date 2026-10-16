<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    protected $fillable =[
        'seller_id',
        'Name',
        'Image_Banner'
    ];

    public function seller (){
        return $this->belongsTo(Seller::class,'seller_id');
    }
}
