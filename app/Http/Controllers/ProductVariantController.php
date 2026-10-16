<?php

namespace App\Http\Controllers;

use App\Models\ProductVariant;
use App\Models\ProductSeller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductVariantController extends Controller
{
    /**
     * រក្សាទុក Variant ថ្មីសម្រាប់ផលិតផលមេណាមួយ
     */
    public function store(Request $request, $productSellerId)
    {
        // ត្រួតពិនិត្យទិន្នន័យដែលបញ្ជូនមក (Validation)
        $request->validate([
            'variant_name'   => 'required|string|max:255',
            'product_cost'   => 'nullable|numeric',
            'product_price'  => 'nullable|numeric',
            'discount_price' => 'nullable|numeric',
            'product_stock'  => 'required|integer',
            'product_sku'    => 'nullable|string|unique:product_variants,product_sku',
            'image'          => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $sellerId = auth()->guard('seller-api')->id();
        $productSeller = ProductSeller::where('seller_id', $sellerId)->findOrFail($productSellerId);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('variants', 'public');
        }

        $variant = ProductVariant::create([
            'product_seller_id' => $productSeller->id,
            'variant_name'      => $request->variant_name,
            'product_cost'      => $request->product_cost,
            'product_price'     => $request->product_price,
            'discount_price'    => $request->discount_price,
            'product_stock'     => $request->product_stock,
            'product_sku'       => $request->product_sku,
            'image'             => $imagePath,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'បានបន្ថែមខ្នាត/ជម្រើសថ្មីជោគជ័យ!',
            'data'    => $variant
        ], 201);
    }

    /**
     * លុប Variant ចោល
     */
    public function destroy($id)
    {
        $sellerId = auth()->guard('seller-api')->id();
        $variant = ProductVariant::whereHas('productSeller', function ($query) use ($sellerId) {
            $query->where('seller_id', $sellerId);
        })->findOrFail($id);

        if ($variant->image && Storage::disk('public')->exists($variant->image)) {
            Storage::disk('public')->delete($variant->image);
        }

        $variant->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'បានលុបជម្រើសនេះជោគជ័យ!'
        ]);
    }

    /**
     * បង្ហាញ Variants ទាំងអស់ ឬតាម Product ID
     */
    public function show_variant(Request $request, $productSellerId = null)
    {
        if ($productSellerId) {
            $variants = ProductVariant::where('product_seller_id', $productSellerId)->get();
        } else {
            $variants = ProductVariant::all();
        }

        return response()->json([
            'status' => 'success',
            'data'   => $variants
        ]);
    }
}