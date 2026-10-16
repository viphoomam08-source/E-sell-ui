<?php

namespace Tests\Feature;

use App\Models\Buyer;
use App\Models\OrderTracking;
use App\Models\ProductSeller;
use App\Models\ProductVariant;
use App\Models\Seller;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_sensitive_api_routes_require_authentication(): void
    {
        $this->postJson('/api/register')->assertUnauthorized();
        $this->deleteJson('/api/buyer-delete/1')->assertUnauthorized();
        $this->postJson('/api/category')->assertUnauthorized();
        $this->getJson('/api/reports/today')->assertUnauthorized();
        $this->postJson('/api/reports/dispatch')->assertUnauthorized();
        $this->postJson('/api/track-order')->assertUnauthorized();
        $this->getJson('/api/buyer-orders')->assertUnauthorized();
        $this->getJson('/api/order-display')->assertUnauthorized();
        $this->putJson('/api/order-status/1')->assertUnauthorized();
        $this->postJson('/api/banner-input')->assertUnauthorized();
        $this->deleteJson('/api/product-variants/1')->assertUnauthorized();
        $this->postJson('/api/history')->assertUnauthorized();
        $this->postJson('/api/comment')->assertUnauthorized();
    }

    public function test_buyer_password_hash_is_not_returned_by_registration_or_login(): void
    {
        $payload = [
            'username' => 'New buyer',
            'email' => 'new-buyer@example.test',
            'password' => 'secret-password',
        ];

        $this->postJson('/api/buyer-register', $payload)
            ->assertOk()
            ->assertJsonMissingPath('buyers.password');

        $this->postJson('/api/buyer-login', [
            'email' => $payload['email'],
            'password' => $payload['password'],
        ])
            ->assertOk()
            ->assertJsonMissingPath('buyers.password');
    }

    public function test_buyer_login_is_rate_limited_after_five_failed_attempts(): void
    {
        $credentials = [
            'email' => 'buyer@example.test',
            'password' => 'wrong-password',
        ];

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/api/buyer-login', $credentials)->assertUnauthorized();
        }

        $this->postJson('/api/buyer-login', $credentials)->assertTooManyRequests();
    }

    public function test_seller_login_is_rate_limited_after_five_failed_attempts(): void
    {
        $credentials = [
            'seller_email' => 'seller@example.test',
            'seller_password' => 'wrong-password',
        ];

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/api/seller-login', $credentials)->assertUnauthorized();
        }

        $this->postJson('/api/seller-login', $credentials)->assertTooManyRequests();
    }

    public function test_seller_cannot_modify_another_sellers_variant(): void
    {
        $owner = Seller::create([
            'seller_name' => 'Owner',
            'seller_email' => 'owner@example.test',
            'seller_password' => bcrypt('password'),
            'profile_pic' => 'owner.jpg',
        ]);
        $otherSeller = Seller::create([
            'seller_name' => 'Other seller',
            'seller_email' => 'other@example.test',
            'seller_password' => bcrypt('password'),
            'profile_pic' => 'other.jpg',
        ]);
        $product = ProductSeller::create([
            'seller_id' => $owner->id,
            'product_name' => 'Owner product',
            'product_cost' => 5,
            'product_price' => 10,
            'product_stock' => 2,
            'category_id' => 1,
        ]);
        $variant = ProductVariant::create([
            'product_seller_id' => $product->id,
            'variant_name' => 'Large',
            'product_stock' => 1,
            'image' => 'large.jpg',
        ]);

        $this->actingAs($otherSeller, 'seller-api')
            ->deleteJson("/api/product-variants/{$variant->id}")
            ->assertNotFound();

        $this->assertDatabaseHas('product_variants', ['id' => $variant->id]);

        $this->actingAs($otherSeller, 'seller-api')
            ->postJson("/api/product-variants/{$product->id}", [
                'variant_name' => 'Unauthorized variant',
                'product_stock' => 1,
            ])
            ->assertNotFound();

        $this->assertDatabaseCount('product_variants', 1);
    }

    public function test_public_order_tracking_does_not_return_buyer_contact_or_address(): void
    {
        $buyer = Buyer::create([
            'username' => 'Private buyer',
            'email' => 'private@example.test',
            'password' => bcrypt('password'),
        ]);
        $order = new OrderTracking;
        $order->forceFill([
            'order_code' => 'ORD-PRIVATE',
            'buyer_id' => $buyer->id,
            'status' => 'pending',
            'shipping_address' => 'Private address',
            'phone' => '123456789',
            'total_amount' => 20,
            'note' => 'Private note',
            'items' => [[
                'product_name' => 'Public item',
                'quantity' => 2,
                'subtotal' => 20,
            ]],
        ])->save();

        $response = $this->getJson('/api/track-order/ORD-PRIVATE')
            ->assertOk()
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.items.0.product_name', 'Public item');

        $this->assertArrayNotHasKey('buyer_id', $response->json('data'));
        $this->assertArrayNotHasKey('phone', $response->json('data'));
        $this->assertArrayNotHasKey('shipping_address', $response->json('data'));
        $this->assertArrayNotHasKey('note', $response->json('data'));
    }
}
