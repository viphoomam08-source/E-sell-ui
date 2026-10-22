<?php

namespace App\Events;

use App\Models\Chat;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatMessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public readonly Chat $chat) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("chats.{$this->chat->buyer_id}.{$this->chat->seller_id}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'chat.message.sent';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->chat->id,
            'buyer_id' => $this->chat->buyer_id,
            'seller_id' => $this->chat->seller_id,
            'sender_type' => $this->chat->sender_type,
            'type' => $this->chat->type,
            'message' => $this->chat->message,
            'created_at' => $this->chat->created_at?->toIso8601String(),
        ];
    }
}
