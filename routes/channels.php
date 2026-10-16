<?php

use App\Models\Buyer;
use App\Models\OrderTracking;
use App\Models\Seller;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel(
    'orders.{orderCode}',
    fn (Buyer $buyer, string $orderCode): bool => OrderTracking::query()
        ->where('order_code', $orderCode)
        ->where('buyer_id', $buyer->id)
        ->exists(),
    ['guards' => ['api-buyer']],
);

Broadcast::channel(
    'sellers.{sellerId}.orders',
    fn (Seller $seller, string $sellerId): bool => (string) $seller->id === $sellerId,
    ['guards' => ['seller-api']],
);
