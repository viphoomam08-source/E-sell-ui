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
        Schema::create('chats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained('sellers')->onDelete('cascade');
            $table->foreignId('buyer_id')->nullable()->contrained('buyers')->onDelete('cascade');
            $table->enum('sender_type',['buyer','seller']);
            $table->string('type')->default('text');
            $table->text('message');
            $table->foreignId('parent_id')->nullable()->constrained('chats')->onDelete('cascade');
            $table->boolean('is_read')->default(false);
            $table->timestamps();

        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chats');
    }
};
