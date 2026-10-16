<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Chat;
class Chat extends Model
{
    protected  $fillable =[
        'seller_id',
        'buyer_id',
        'sender_type',
        'message',
        'type',
        'is_read'
    ];
    public function seller()
    {
        return $this->belongsTo(Seller::class, 'seller_id');
    }

    public function buyer()
    {
        return $this->belongsTo(Buyer::class, 'buyer_id');
    }
    public function parentMessage(){
        return $this->belongsTo(Chat::class,'parent_id');
    }
    public function Reply(){
        return $this->hasMany(Chat::class,'parent_id');
    }
}
