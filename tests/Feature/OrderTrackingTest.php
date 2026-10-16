<?php

namespace Tests\Feature;

use App\Events\OrderStatusChanged;
use App\Events\SellerOrderPlaced;
use App\Models\Buyer;
use App\Models\Cart;
use App\Models\OrderTracking;
use App\Models\ProductSeller;
use App\Models\Seller;
use App\Notifications\OrderStatusUpdated;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class OrderTrackingTest extends TestCase
{
    use RefreshDatabase;

    public function test_order_details_are_saved_and_sellers_can_advance_order_status(): void
    {
        $this->configureReverbForTests();
        Notification::fake();
        Event::fake([OrderStatusChanged::class, SellerOrderPlaced::class]);
        config(['mail.default' => 'smtp']);

        $buyer = Buyer::create([
            'username' => 'Order Buyer',
            'email' => 'buyer@example.test',
            'password' => bcrypt('password'),
        ]);

        $seller = Seller::create([
            'seller_name' => 'Order Seller',
            'seller_email' => 'seller@example.test',
            'seller_password' => bcrypt('password'),
            'profile_pic' => 'seller.jpg',
        ]);

        $product = ProductSeller::create([
            'seller_id' => $seller->id,
            'product_name' => 'Sample product',
            'product_cost' => 8,
            'product_price' => 12,
            'product_stock' => 5,
            'category_id' => 1,
            'image' => 'product.jpg',
        ]);

        Cart::create([
            'buyer_id' => $buyer->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $orderResponse = $this->actingAs($buyer, 'api-buyer')
            ->postJson('/api/track-order', [
                'shipping_address' => '123 Test Street',
                'phone' => '123456789',
            ])
            ->assertCreated()
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.items.0.product_id', $product->id)
            ->assertJsonPath('data.items.0.product_name', 'Sample product')
            ->assertJsonPath('data.items.0.quantity', 2)
            ->assertJsonPath('data.items.0.subtotal', 24)
            ->assertJsonPath('seller_notifications_sent', true);

        $orderId = $orderResponse->json('data.id');
        $orderCode = $orderResponse->json('data.order_code');

        $this->actingAs($buyer, 'api-buyer')
            ->postJson('/broadcasting/auth', [
                'socket_id' => '1234.1234',
                'channel_name' => "private-orders.{$orderCode}",
            ])
            ->assertOk();

        $this->actingAs($seller, 'seller-api')
            ->postJson('/seller/broadcasting/auth', [
                'socket_id' => '1234.1234',
                'channel_name' => "private-sellers.{$seller->id}.orders",
            ])
            ->assertOk();

        $this->actingAs($buyer, 'api-buyer')
            ->getJson('/api/buyer-orders')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.order_code', $orderCode);

        $otherBuyer = Buyer::create([
            'username' => 'Another Buyer',
            'email' => 'other@example.test',
            'password' => bcrypt('password'),
        ]);

        $this->assertNotSame($buyer->id, $otherBuyer->id);

        $this->actingAs($otherBuyer, 'api-buyer')
            ->getJson('/api/buyer-orders')
            ->assertOk()
            ->assertJsonCount(0, 'data');

        $this->actingAs($otherBuyer, 'api-buyer')
            ->postJson('/broadcasting/auth', [
                'socket_id' => '1234.1234',
                'channel_name' => "private-orders.{$orderCode}",
            ])
            ->assertForbidden();

        $otherSeller = Seller::create([
            'seller_name' => 'Another Seller',
            'seller_email' => 'another-seller@example.test',
            'seller_password' => bcrypt('password'),
            'profile_pic' => 'another-seller.jpg',
        ]);

        $this->actingAs($otherSeller, 'seller-api')
            ->postJson('/seller/broadcasting/auth', [
                'socket_id' => '1234.1234',
                'channel_name' => "private-sellers.{$seller->id}.orders",
            ])
            ->assertForbidden();

        $this->actingAs($seller, 'seller-api')
            ->getJson('/api/order-display')
            ->assertOk()
            ->assertJsonPath('data.0.buyer.email', 'buyer@example.test')
            ->assertJsonPath('data.0.items.0.product_name', 'Sample product');

        $dailyReport = $this->actingAs($seller, 'seller-api')
            ->getJson('/api/seller-profit')
            ->assertOk()
            ->assertJsonPath('data.total_orders', 1)
            ->assertJsonPath('data.total_revenue', 24)
            ->assertJsonPath('data.total_cost', 16)
            ->assertJsonPath('data.total_profit', 8)
            ->assertJsonPath('data.total_items_sold', 2)
            ->assertJsonPath('data.daily_breakdown.0.order_count', 1)
            ->assertJsonPath('data.daily_breakdown.0.items_sold', 2)
            ->assertJsonPath('data.daily_breakdown.0.revenue', 24)
            ->assertJsonPath('data.daily_breakdown.0.cost', 16)
            ->assertJsonPath('data.daily_breakdown.0.profit', 8);
        $this->assertSame(
            substr($orderResponse->json('data.created_at'), 0, 10),
            $dailyReport->json('data.daily_breakdown.0.date'),
        );

        $this->actingAs($seller, 'seller-api')
            ->putJson("/api/order-status/{$orderId}", ['status' => 'confirmed'])
            ->assertOk()
            ->assertJsonPath('data.status', 'confirmed')
            ->assertJsonPath('notification_sent', true)
            ->assertJsonPath('realtime_notification_sent', true);

        $this->assertSame(3, $product->fresh()->product_stock);
        Notification::assertSentToTimes($buyer, OrderStatusUpdated::class, 1);
        Event::assertDispatchedTimes(OrderStatusChanged::class, 1);
        Event::assertDispatched(SellerOrderPlaced::class, fn (SellerOrderPlaced $event): bool =>
            $event->sellerId === (string) $seller->id
            && $event->orderCode === $orderCode
            && $event->items === [['product_name' => 'Sample product', 'quantity' => 2]]
        );

        $this->actingAs($seller, 'seller-api')
            ->putJson("/api/order-status/{$orderId}", ['status' => 'confirmed'])
            ->assertOk()
            ->assertJsonPath('notification_sent', null);

        $this->assertSame(3, $product->fresh()->product_stock);
        Notification::assertSentToTimes($buyer, OrderStatusUpdated::class, 1);
        Event::assertDispatchedTimes(OrderStatusChanged::class, 1);

        $this->putJson("/api/order-status/{$orderId}", ['status' => 'delivered'])
            ->assertUnprocessable();

        $this->putJson("/api/order-status/{$orderId}", ['status' => 'shipped'])
            ->assertOk()
            ->assertJsonPath('data.status', 'shipped');

        $this->putJson("/api/order-status/{$orderId}", ['status' => 'delivered'])
            ->assertOk()
            ->assertJsonPath('data.status', 'delivered');

        Notification::assertSentToTimes($buyer, OrderStatusUpdated::class, 3);
        Event::assertDispatchedTimes(OrderStatusChanged::class, 3);
    }

    public function test_cancelling_a_confirmed_order_restores_stock_and_notifies_buyer(): void
    {
        $this->configureReverbForTests();
        Notification::fake();
        Event::fake([OrderStatusChanged::class, SellerOrderPlaced::class]);
        config(['mail.default' => 'smtp']);

        $buyer = Buyer::create([
            'username' => 'Order Buyer',
            'email' => 'buyer@example.test',
            'password' => bcrypt('password'),
        ]);

        $seller = Seller::create([
            'seller_name' => 'Order Seller',
            'seller_email' => 'seller@example.test',
            'seller_password' => bcrypt('password'),
            'profile_pic' => 'seller.jpg',
        ]);

        $product = ProductSeller::create([
            'seller_id' => $seller->id,
            'product_name' => 'Sample product',
            'product_cost' => 8,
            'product_price' => 12,
            'product_stock' => 5,
            'category_id' => 1,
            'image' => 'product.jpg',
        ]);

        $order = OrderTracking::create([
            'order_code' => 'ORD-CANCEL-TEST',
            'buyer_id' => $buyer->id,
            'product_id' => $product->id,
            'status' => 'pending',
            'shipping_address' => '123 Test Street',
            'phone' => '123456789',
            'total_amount' => 24,
            'items' => [[
                'product_id' => $product->id,
                'seller_id' => $seller->id,
                'quantity' => 2,
            ]],
        ]);

        $this->actingAs($seller, 'seller-api')
            ->putJson("/api/order-status/{$order->id}", ['status' => 'confirmed'])
            ->assertOk();

        $this->actingAs($seller, 'seller-api')
            ->putJson("/api/order-status/{$order->id}", ['status' => 'cancelled'])
            ->assertOk()
            ->assertJsonPath('notification_sent', true)
            ->assertJsonPath('realtime_notification_sent', true);

        $this->assertSame(5, $product->fresh()->product_stock);
        Notification::assertSentToTimes($buyer, OrderStatusUpdated::class, 2);
        Event::assertDispatchedTimes(OrderStatusChanged::class, 2);
    }

    private function configureReverbForTests(): void
    {
        config([
            'broadcasting.default' => 'reverb',
            'broadcasting.connections.reverb.key' => 'test-key',
            'broadcasting.connections.reverb.secret' => 'test-secret',
            'broadcasting.connections.reverb.app_id' => 'test-app',
            'broadcasting.connections.reverb.options' => [
                'host' => '127.0.0.1',
                'port' => 8080,
                'scheme' => 'http',
                'useTLS' => false,
            ],
        ]);

        require base_path('routes/channels.php');
    }
}
