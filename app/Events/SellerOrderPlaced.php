<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SellerOrderPlaced implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly string $sellerId,
        public readonly string $orderCode,
        public readonly string $createdAt,
        public readonly string $buyerName,
        public readonly array $items,
    ) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel("sellers.{$this->sellerId}.orders")];
    }

    public function broadcastAs(): string
    {
        return 'seller.order.placed';
    }

    public function broadcastWith(): array
    {
        return [
            'order_code' => $this->orderCode,
            'created_at' => $this->createdAt,
            'buyer_name' => $this->buyerName,
            'items' => $this->items,
        ];
    }
}
