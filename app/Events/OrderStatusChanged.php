<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderStatusChanged implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly string $orderCode,
        public readonly string $status,
        public readonly string $updatedAt,
    ) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel("orders.{$this->orderCode}")];
    }

    public function broadcastAs(): string
    {
        return 'order.status.changed';
    }

    public function broadcastWith(): array
    {
        return [
            'order_code' => $this->orderCode,
            'status' => $this->status,
            'updated_at' => $this->updatedAt,
        ];
    }
}
