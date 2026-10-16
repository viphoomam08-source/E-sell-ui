<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Comment;

class CommentController extends Controller
{
    public function Comment_On_product(Request $request)
    {
        $buyer = auth()->guard('api-buyer')->user();
        if (!$buyer) {
            return response()->json([
                'status' => false,
                'message' => "you are not login yet"
            ], 401);
        }

        $validated = $request->validate([
'product_seller_id' => 'required|exists:product_sellers,id', 
            'parent_id' => 'nullable|exists:comments,id',
            'message' => 'required|string|max:255',
            'seller_id' => 'nullable|exists:sellers,id'
        ]);

        $comment = Comment::create([
            'product_seller_id' => $validated['product_seller_id'],
            'buyer_id' => $buyer->id,
            'parent_id' => $validated['parent_id'] ?? null,
            'message' => $validated['message'], 
            'seller_id' => $validated['seller_id'] ?? null
        ]);

        return response()->json([
            'status' => true,
            'message' => "success", 
            'data' => $comment
        ], 201);
    }
    
    public function Diplay_comment($product_seller_id)
    {
        $comments = Comment::where('product_seller_id', $product_seller_id)
            ->whereNull('parent_id')
            ->with([
                'buyer', 
                'seller', 
                'replies.buyer', 
                'replies.seller'
            ])
            ->latest()
            ->get();

        return response()->json([
            'status' => true,
            'data' => $comments
        ]);
    }
}