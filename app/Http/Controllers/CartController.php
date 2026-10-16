<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Cart;
use App\Models\ProductSeller;

class CartController extends Controller
{
    public function addToCart(Request $request)
    {
        $request->validate([    
            'product_id' => 'required|exists:product_sellers,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $buyer = auth()->guard('api-buyer')->user();

        if (!$buyer) {
            return response()->json([
                'status' => false,
                'message' => 'សូម Login ចូលគណនីរបស់អ្នកជាមុនសិន!'
            ], 401);
        }

        $buyerId = $buyer->id;
        $productId = $request->product_id;
        $quantity = $request->quantity;

        try {
            $result = DB::transaction(function () use ($buyerId, $productId, $quantity) {
                
                // Check if product exists and has enough stock (without decrementing it yet)
                $product = ProductSeller::where('id', $productId)->lockForUpdate()->first();
                if (!$product || $product->product_stock < $quantity) {
                    throw new \Exception('ចំនួនស្តុកផលិតផលមិនគ្រប់គ្រាន់ទេ!');
                }

                // Match your original table columns (buyer_id, product_id)
                $cartItem = Cart::where('buyer_id', $buyerId)
                                ->where('product_id', $productId)
                                ->first();

                if ($cartItem) {
                    $cartItem->quantity += $quantity;
                    $cartItem->save();
                } else {
                    $cartItem = Cart::create([
                        'buyer_id' => $buyerId,
                        'product_id' => $productId,
                        'quantity' => $quantity,
                    ]);
                }

                // ❌ Stock is no longer decremented here. It will safely drop only when the order is confirmed!

                return $cartItem;
            });

            return response()->json([
                'status' => true,
                'message' => 'បានបន្ថែមទំនិញចូលកន្ត្រកដោយជោគជ័យ!',
                'data' => $result->load('product') 
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function getCartItems(Request $request)
    {
        $buyer = auth()->guard('api-buyer')->user();

        if (!$buyer) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthenticated'
            ], 401);
        }

        $carts = Cart::where('buyer_id', $buyer->id)
                     ->with('product')
                     ->get();

        return response()->json([
            'status' => true,
            'data' => $carts
        ], 200);
    }
    public function DeleteCart(Request $request,$id){
        $buyer= auth()->guard('api-buyer')->user();
        if (!$buyer) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthenticated'
            ], 401);
        }
        $delete_cart = Cart::where('buyer_id', $buyer->id)->where('id',$id)->first();
         if(!$delete_cart){
            return response()->json([
            'status' => false,
            'message' => 'រកไม่ឃើញទំនិញក្នុងកន្ត្រកនេះទេ!'
        ], 404);
    }
        $delete_cart->delete();
return response()->json([
        'status' => true,
        'message' => 'បានលុបទំនិញចេញពីកន្ត្រកដោយជោគជ័យ!'
    ], 200);
    }
}   