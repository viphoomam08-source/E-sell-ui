<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ProductSeller;
use Illuminate\Support\Facades\Cache;

class SearchController extends Controller
{
    public function Search_product(Request $request)
    {
        try {
            $keyword = $request->input('keyword');

            if (!$keyword) {
                return response()->json([
                    'status' => true,
                    'data' => []
                ], 200);
            }

            $cacheKey = 'search_products_' . md5(strtolower(trim($keyword)));

            $products = Cache::remember($cacheKey, now()->addMinutes(10), function () use ($keyword) {
                return ProductSeller::with(['seller', 'category'])
                    ->where('product_name', 'LIKE', "%{$keyword}%")
                    ->orWhere('brand', 'LIKE', "%{$keyword}%")
                    ->limit(20)
                    ->get();
            });

            return response()->json([
                'status' => true,
                'data' => $products
            ], 200);

        } catch (\Exception $e) {
            return response()->json([   
                'status' => false,
                'message' => 'មានបញ្ហាក្នុងការស្វែងរកទំនិញ!',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}