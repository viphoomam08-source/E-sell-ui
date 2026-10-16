<?php

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;

Broadcast::routes(['middleware' => ['api', 'auth:api-buyer']]);
Broadcast::routes([
    'prefix' => 'seller',
    'middleware' => ['api', 'auth:seller-api'],
]);

Route::get('/', function () {
    return view('welcome');
});
