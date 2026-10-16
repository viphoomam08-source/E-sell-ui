<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\OrderTracking;
use App\Models\ProductSeller;
use App\Models\Chat;

class ChatController extends Controller
{
    public function List_buyer(Request $request)
    {
        $seller = auth()->guard('seller-api')->user();

        if (!$seller) {
            return response()->json([
                "status" => false,
                "message" => "Please login"
            ], 401);
        }

        $buyers = OrderTracking::with('buyer')
            ->get()
            ->filter(function ($order) use ($seller) {
                return collect($order->items ?? [])
                    ->contains(fn ($item) => (int) ($item['seller_id'] ?? 0) === (int) $seller->id);
            })
            ->pluck('buyer')
            ->filter()
            ->unique('id')
            ->values();

        return response()->json([
            "status" => true,
            "message" => "Buyer list retrieved successfully",
            "data" => $buyers
        ], 200);
    }


    public function SendPRoductList(Request $request)
    {
        $seller = auth()->guard('seller-api')->user();
        if (!$seller) {
            return response()->json([
                "status" => false,
                "message" => "pls login again"
            ], 401);
        }

        // ត្រងយកតែទំនិញរបស់ Seller ដែល Login ផ្ទាល់
        $product = ProductSeller::with(['seller', 'category', 'variants'])
            ->where('seller_id', $seller->id)
            ->get();

        return response()->json([
            "status" => true,
            "data" => $product
        ], 200);
    }

    public function SendMessage(Request $request)
    {
        $seller = auth()->guard('seller-api')->user();
        
        if (!$seller) {
            return response()->json([
                "status" => false,
                "message" => "Please login"
            ], 401);
        }

        // ១. បន្ថែម buyer_id ចូលក្នុងការ Validate
        $validated = $request->validate([
            'buyer_id' => 'required|exists:buyers,id',
            'message' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'parent_id' => 'nullable|exists:chats,id'
        ]);

        $messageText = $validated['message'] ?? '';
        $type = 'text';

        // ២. ຈັດការ Upload រូបភាព ឬទំនិញ
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('chat-images', 'public');
            $messageText = asset('storage/' . $imagePath);
            $type = 'image';
        } elseif (str_starts_with($messageText, 'Product:')) {
            $type = 'product';
        }

        // ៣. រក្សាទុកចូល Database ដោយមាន buyer_id ត្រឹមត្រូវ
        $chat = Chat::create([
            'seller_id' => $seller->id,
            'buyer_id' => $validated['buyer_id'] ?? null, // 👈 ចាំបាច់ត្រូវមានកន្លែងនេះ!
            'parent_id' => $validated['parent_id'] ?? null,
            'sender_type' => 'seller',
            'type' => $type,
            'message' => $messageText,
            'is_read' => false
        ]);

        return response()->json([
            "status" => true,
            "message" => "Message sent successfully",
            "data" => $chat
        ], 201);
    }

    public function getMessage(Request $request, $buyer_id)
    {
        $seller = auth()->guard('seller-api')->user();

        if (!$seller) {
            return response()->json([
                "status" => false,
                "message" => "Please login"
            ], 401);
        }

        // ៤. ទាញយកសារត្រឹមត្រូវតាម seller_id និង buyer_id
        $messages = Chat::where('seller_id', $seller->id)
            ->where('buyer_id', $buyer_id)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            "status" => true,
            "data" => $messages
        ], 200);
    }
    public function buyerGetMessages(Request $request, $seller_id)
    {
        $buyer = auth()->guard('api-buyer')->user();

        if (!$buyer) {
            return response()->json(["status" => false, "message" => "Please login"], 401);
        }

        $messages = Chat::where('buyer_id', $buyer->id)
            ->where('seller_id', $seller_id)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            "status" => true,
            "data" => $messages
        ], 200);
    }

    // 2. ឱ្យ Buyer ផ្ញើសារទៅ Seller
    public function buyerSendMessage(Request $request)
    {
        $buyer = auth()->guard('api-buyer')->user();
        
        if (!$buyer) {
            return response()->json(["status" => false, "message" => "Please login"], 401);
        }

        $validated = $request->validate([
            'seller_id' => 'required|exists:sellers,id',
            'message' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $messageText = $validated['message'] ?? '';
        $type = 'text';

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('chat-images', 'public');
            $messageText = asset('storage/' . $imagePath);
            $type = 'image';
        }

        // រក្សាទុកចូលតារាង chats តែមួយ
        $chat = Chat::create([
            'seller_id' => $validated['seller_id'],
            'buyer_id' => $buyer->id,
            'sender_type' => 'buyer', // 👈 កត់ត្រាថាផ្ញើដោយ buyer
            'type' => $type,
            'message' => $messageText,
            'is_read' => false
        ]);

        return response()->json([
            "status" => true,
            "message" => "Message sent successfully",
            "data" => $chat
        ], 201);
    }
}