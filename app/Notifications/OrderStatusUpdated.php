<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderStatusUpdated extends Notification
{
    public function __construct(
        private readonly string $orderCode,
        private readonly string $status,
        private readonly string $buyerName,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Order {$this->orderCode} status update")
            ->greeting("Hello, {$this->buyerName}!")
            ->line("The status of your order {$this->orderCode} is now {$this->status}.")
            ->line('Thank you for shopping with us.');
    }
}
