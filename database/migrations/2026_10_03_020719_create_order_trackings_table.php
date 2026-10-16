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
        Schema::create('order_trackings', function (Blueprint $table) {
    $table->id();
    $table->string('order_code')->unique();
     $table->foreignId('product_id')->constrained('product_sellers')->onDelete('cascade');

    $table->foreignId('buyer_id')->constrained('buyers')->onDelete('cascade');
    $table->string('status')->default('pending'); 
    $table->text('shipping_address');
    $table->string('phone');
    $table->decimal('total_amount', 10, 2);
    $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_trackings');
    }
};
    