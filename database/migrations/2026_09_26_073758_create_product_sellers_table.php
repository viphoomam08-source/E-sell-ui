<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {Schema::create('product_sellers', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('seller_id')->nullable();
    $table->string('product_name');
    $table->text('product_description')->nullable();
    $table->decimal('product_cost', 10, 2);
    $table->decimal('product_price', 10, 2);
    $table->decimal('discount_price', 10, 2)->nullable();
    $table->integer('product_stock');
    $table->string('product_sku')->unique()->nullable();
    $table->string('brand')->nullable();
    $table->string('brand_image')->nullable();
    $table->unsignedBigInteger('category_id');
  $table->string('product_video')->nullable(); 
    $table->string('image')->nullable();
    $table->enum('status', ['មានស្តុក', 'អស់ស្តុក'])->default('មានស្តុក');
    $table->timestamps();
});
    }

    public function down(): void
    {
        Schema::dropIfExists('product_sellers');
    }

};
