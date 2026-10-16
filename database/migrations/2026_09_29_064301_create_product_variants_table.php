<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            
$table->foreignId('product_seller_id')->constrained('product_sellers')->onDelete('cascade');
$table->string('variant_name');

$table->decimal('product_cost',10,2)->nullable();
$table->decimal('product_price',10,2)->nullable();
$table->integer('product_stock');
$table->string('product_sku')->unique()->nullable();
$table->string('image');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
