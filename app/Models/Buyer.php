<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject; // ឬ namshi/tymon អាស្រ័យលើ Package JWT ដែលបងប្រើ

class Buyer extends Authenticatable implements JWTSubject
{
    use Notifiable;

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $fillable = [
        'username', 'email', 'password',
    ];

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }



    public function getJWTCustomClaims()
    {
        return [];
    }
    public function cart(){
        return $this->hasMany(Cart::class,'buyer_id');
    }
}