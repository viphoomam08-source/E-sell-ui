<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable; // ចាំបាច់ត្រូវប្រើ Authenticatable សម្រាប់ JWT/Auth Guard
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class Seller extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    protected $table = 'sellers';

    protected $fillable = [

        'seller_name',
        'seller_email',
        'seller_password',
        'profile_pic',
        'Image', 
        'decribe',
        'role',
    ];

    protected $hidden = [
        'seller_password',
        'remember_token',
    ];

    public function getAuthPassword()
    {
        return $this->seller_password;
    }


    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }
    public function products()
{
    return $this->hasMany(ProductSeller::class, 'seller_id', 'id');
}
public function banners (){
    return $this->hasMany(Banner::class,'seller_id');
}
}