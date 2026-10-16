<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Category;
use App\Models\ProductSeller;
use App\Models\Register;
use App\Models\Seller;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuditLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_seller_product_deletion_is_recorded_and_only_the_sellers_logs_are_returned(): void
    {
        $user = Register::create([
            'name' => 'Admin',
            'email' => 'admin@example.test',
            'password' => bcrypt('password'),
        ]);

        $category = Category::create([
            'user_id' => $user->id,
            'category_name' => 'Test category',
        ]);

        $seller = Seller::create([
            'seller_name' => 'Audit Seller',
            'seller_email' => 'audit-seller@example.test',
            'seller_password' => bcrypt('password'),
            'profile_pic' => 'seller.jpg',
        ]);
        $otherSeller = Seller::create([
            'seller_name' => 'Other Seller',
            'seller_email' => 'other-seller@example.test',
            'seller_password' => bcrypt('password'),
            'profile_pic' => 'other-seller.jpg',
        ]);

        $product = ProductSeller::create([
            'seller_id' => $seller->id,
            'product_name' => 'Test product',
            'product_cost' => 8,
            'product_price' => 12,
            'product_stock' => 5,
            'category_id' => $category->id,
        ]);

        AuditLog::create([
            'seller_id' => $otherSeller->id,
            'action' => 'DELETE_PRODUCT',
            'description' => 'Another seller deleted a product.',
        ]);

        $this->actingAs($seller, 'seller-api')
            ->deleteJson("/api/product-delete/{$product->id}")
            ->assertOk()
            ->assertJsonPath('status', true);

        $this->assertSoftDeleted('product_sellers', ['id' => $product->id]);

        $this->actingAs($seller, 'seller-api')
            ->getJson('/api/getLog')
            ->assertOk()
            ->assertJsonPath('status', true)
            ->assertJsonPath('data.0.action', 'DELETE_PRODUCT')
            ->assertJsonPath('data.0.description', "Seller ID {$seller->id} deleted product: 'Test product' (ID: {$product->id})")
            ->assertJsonCount(1, 'data');
    }

    public function test_audit_logs_require_seller_authentication(): void
    {
        $this->getJson('/api/getLog')
            ->assertUnauthorized();
    }
}
