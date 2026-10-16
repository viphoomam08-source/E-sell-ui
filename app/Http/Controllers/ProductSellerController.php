<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ProductSeller;
use App\Models\Seller;
use Illuminate\Support\Facades\DB;
use App\Models\AuditLog;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;

class ProductSellerController extends Controller
{
    public function ProductSeller(Request $request)
    {
        $sellerId = auth()->guard('seller-api')->id();
        $validatedData = $request->validate([
            "product_name"        => 'required|string|max:255',
            "product_description" => 'nullable|string',
            "product_cost"        => 'required|numeric|min:0',
            "product_price"       => 'required|numeric|min:0',
            "discount_price"      => 'nullable|numeric|min:0|lt:product_price',
            "product_stock"       => 'required|integer|min:0',
            "product_sku"         => 'nullable|string|unique:product_sellers,product_sku',
            "brand"               => 'nullable|string|max:100',
            'brand_image'         => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            "category_id"         => 'required|exists:categories,id', 
            'Image'               => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'product_video'       => 'nullable|mimes:mp4,mov,ogg,qt,webm|max:51200', 
            "status"              => 'nullable|in:មានស្តុក,អស់ស្តុក',
            'year'                => 'nullable|digits:4',
            'month'               => 'nullable|numeric|between:1,12',
            'day'                 => 'nullable|numeric|between:1,31',
            'time'                => 'nullable|string',
        ]);
        $publishedAt = null;
        if ($request->filled('year') && $request->filled('month') && $request->filled('day') && $request->filled('time')) {
        $dateTimeString = "{$request->year}-{$request->month}-{$request->day} {$request->time}:00";
        $publishedAt = Carbon::parse($dateTimeString);

        if ($publishedAt->isPast()) {
            return response()->json([
                'status'  => false,
                'message' => 'មិនអាចកំណត់ពេលផុសក្នុងអតីតកាលបានទេ។'
            ], 422);
        }
    }

        $imagePath = null;
        if ($request->hasFile('Image')) {
            $imagePath = $request->file('Image')->store('products', 'public');
        }

        $brandImagePath = null;
        if ($request->hasFile('brand_image')) {
            $brandImagePath = $request->file('brand_image')->store('brands', 'public');
        }
        $productVideoPath = null;
        if ($request->hasFile('product_video')) {
            $productVideoPath = $request->file('product_video')->store('product-videos', 'public');
        }
        $product = ProductSeller::create([
            'seller_id'           => $sellerId,
            'product_name'        => $validatedData['product_name'],
            'product_description' => $validatedData['product_description'] ?? null,
            'product_cost'        => $validatedData['product_cost'],
            'product_price'       => $validatedData['product_price'],
            'discount_price'      => $validatedData['discount_price'] ?? null,
            'product_stock'       => $validatedData['product_stock'],
            'product_sku'         => $validatedData['product_sku'] ?? 'SKU-' . strtoupper(uniqid()),
            'brand'               => $validatedData['brand'] ?? null,
            'brand_image'         => $brandImagePath,
            'category_id'         => $validatedData['category_id'],
            'image'               => $imagePath,
            'product_video'       => $productVideoPath, 
            'published_at'        => $publishedAt, // 👈 បញ្ចូលទីនេះ
            'status'              => $validatedData['status'] ?? 'មានស្តុក',
        ]);

        return response()->json([
            'message' => 'Product added successfully with Admin Category!',
            'data'    => $product->load('category','seller') 
        ], 201);
    }


    public function Show_Product(Request $request)
    {
        $sellerId = auth()->guard('seller-api')->id();
 
        if (!$sellerId) {
            return response()->json([
                "message" => "Unauthorized or Seller ID not found",
                "total" => 0,
                "data" => []
            ], 401);
        }

        $products = ProductSeller::with(['category','variants'])
            ->where('seller_id', $sellerId)
            ->get();

        return response()->json([
            "message" => "Seller products retrieved successfully",
            "total"   => $products->count(),
            "data"    => $products
        ], 200);
    }

    public function Product_all(Request $request)
    {
        $product = ProductSeller::with(['seller', 'category'])->get();
        
        return response()->json([
            'message' => "show_all",
            'product' => $product
        ]);
    }

    public function show($id)
    {
        $product = ProductSeller::with(['seller', 'category','variants'])->find($id);

        if (!$product) {
            return response()->json([
                'status' => false,
                'message' => 'Product not found'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'product' => $product
        ], 200);
    }

    public function show_dicount(Request $request)
    {
        $dicount_product = ProductSeller::with(['seller', 'category'])
            ->whereNotNull('discount_price')
            ->where('discount_price', '>', 0)
            ->get();
            
        return response()->json([
            'message' => 'Discounted products retrieved successfully',
            'total' => $dicount_product->count(),
            'product' => $dicount_product
        ]);
    }

    public function biggest_dicount_of_day(Request $request)
    {
        $big_dicount = ProductSeller::with(['seller', 'category'])
            ->whereColumn('discount_price', '<', 'product_price')
            ->whereNotNull('discount_price')
            ->select('product_sellers.*', DB::raw('((product_price - discount_price) / product_price) * 100 as bigDicount'))
            ->orderBy('bigDicount', 'DESC')
            ->take(3)
            ->get(); 

        return response()->json([
            'status' => 'success',
            'data' => $big_dicount
        ]);
    }

    public function relatedBySeller($sellerId, $currentProductId)
    {
        $products = ProductSeller::where('seller_id', $sellerId)
                   ->where('id', '!=', $currentProductId)
                   ->get();
                   
        return response()->json([
            'products' => $products
        ]);
    }

    public function show_seller_discount($sellerId)
    {
        $products = ProductSeller::with(['seller', 'category', 'variants'])
            ->where('seller_id', $sellerId)
            ->whereColumn('discount_price', '<', 'product_price')
            ->whereNotNull('discount_price')
            ->where('discount_price', '>', 0)
            ->select('product_sellers.*', DB::raw('((product_price - discount_price) / product_price) * 100 as bigDicount'))
            ->orderBy('bigDicount', 'DESC')
            ->take(3)
            ->get();

        return response()->json([
            'status' => true,
            'message' => 'Seller discounted products retrieved successfully',
            'total' => $products->count(),
            'data' => $products 
        ]);
    }

    public function show_product_not_discount(Request $request)
    {
        $products = ProductSeller::with(['seller', 'category', 'variants'])
            ->where(function ($query) {
                $query->whereNull('discount_price')
                      ->orWhere('discount_price', 0);
            })
            ->get();

        return response()->json([
            'status' => true,
            'message' => 'Seller products without discount retrieved successfully',
            'total' => $products->count(),
            'data' => $products
        ]);
    }
    public function show_product_videos(Request $request)
    {
        $videos = ProductSeller::with(['seller', 'category'])
            ->whereNotNull('product_video')
            ->where('product_video', '!=', '')
            ->get();

        return response()->json([
            'status' => true,
            'message' => 'Product videos retrieved successfully',
            'total' => $videos->count(),
            'product' => $videos 
        ], 200);
    }

    public function DeleteProductSell(Request $request, $id)
    {
        $seller = auth()->guard('seller-api')->user();

        if (!$seller) {
            return response()->json([
                'status' => false,
                'message' => 'Please login',
            ], 401);
        }

        $sellerId = $seller->id;
        $product = ProductSeller::where('id', $id)->where('seller_id', $sellerId)->first();

        if (!$product) {
            return response()->json([
                'status' => false,
                'message' => 'Product not found or you do not have permission to delete this product',
            ], 404);
        }

        $this->recordProductDeletion($seller, $product);

        return response()->json([
            'status' => true,
            'message' => 'Product deleted successfully',
        ], 200);
    }

    public function UpdateProductSell(Request $request, $id)
    {
        try {
            $seller = auth()->guard('seller-api')->user();
            if (!$seller) {
                return response()->json([
                    'status' => false,
                    'message' => 'Please login',
                ], 401);
            }

            $product = ProductSeller::where('id', $id)->where('seller_id', $seller->id)->first();

            if (!$product) {
                return response()->json([
                    'status' => false,
                    'message' => 'Product not found or you do not have permission to update this product'
                ], 404);
            }

            $validatedData = $request->validate([
                "product_name"        => 'required|string|max:255',
                "product_description" => 'nullable|string',
                "product_cost"        => 'required|numeric|min:0',
                "product_price"       => 'required|numeric|min:0',
                "discount_price"      => 'nullable|numeric|min:0|lt:product_price',
                "product_stock"       => 'required|integer|min:0',
                "product_sku"         => 'nullable|string|unique:product_sellers,product_sku,' . $id,
                "brand"               => 'nullable|string|max:100',
                'brand_image'         => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
                "category_id"         => 'required|exists:categories,id', 
                'Image'               => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
                'product_video'       => 'nullable|mimes:mp4,mov,ogg,qt,webm|max:51200', 
                "status"              => 'nullable|in:មានស្តុក,អស់ស្តុក',
            ]);

            if ($request->hasFile('Image')) {
                if ($product->image && Storage::disk('public')->exists($product->image)) {
                    Storage::disk('public')->delete($product->image);
                }
                $validatedData['image'] = $request->file('Image')->store('products', 'public');
            }

            // 🛠️ ហៅប្រើប្រាស់ recordProductUpdate ឱ្យបានត្រឹមត្រូវ
            $this->recordProductUpdate($seller, $product, $validatedData);

            return response()->json([
                'status' => true,
                'message' => 'Product updated successfully',
                'product' => $product->fresh()
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function ShowSellerProfile (Request $request)
    {
        $sellers = Seller::with('products')->get();

        return response()->json([
            'success' => true,
            'data' => $sellers
        ]);
    } 

    public function Stock_alert (Request $request)
    {
        $seller = auth()->guard('seller-api')->user();
        if(!$seller){
            return response()->json([
                "message"=>'Please login'
            ]);
        }
        $Alert_stock = ProductSeller::with('seller')->where('seller_id',$seller->id)->where('status','អស់ស្តុក')->get();
        return response()->json([
            "messsage"=>"your Stock is running out",
            "data"=>$Alert_stock,
        ]);
    }

    public function YourActive(Request $request, $id)
    {
        $seller = auth()->guard('seller-api')->user();
        if (!$seller) {
            return response()->json([
                "status" => false,
                "message" => "Please login"
            ], 401);
        }

        $perPage = 5;

        if ($id) {
            $product_delete = ProductSeller::where('id', $id)->where('seller_id', $seller->id)->first();
            if ($product_delete) {
                $this->recordProductDeletion($seller, $product_delete);
            }
        }

        $product_add_today = ProductSeller::where('seller_id', $seller->id)
                                            ->whereDate('created_at', Carbon::today())
                                            ->paginate($perPage);

        $count_today_product = ProductSeller::where('seller_id', $seller->id)
                                            ->whereDate('created_at', Carbon::today())
                                            ->count();

        $count_delete = ProductSeller::where('seller_id', $seller->id)
                                     ->whereDate('deleted_at', Carbon::today())
                                     ->onlyTrashed()
                                     ->count();

        $show_product_deleted = ProductSeller::where('seller_id', $seller->id)
                                           ->whereDate('deleted_at', Carbon::today())
                                           ->onlyTrashed()
                                           ->get();

        return response()->json([
            "status" => true,
            "message" => "Your active today",
            "data" => $product_add_today->items(),
            "count" => $count_today_product,
            "delete_count" => $count_delete, 
            "count_delete" => $count_delete, 
            "show_deleted" => $show_product_deleted,
            "pagination" => [
               "current_page" => $product_add_today->currentPage(),
               "last_page" => $product_add_today->lastPage(),
               "has_more" => $product_add_today->hasMorePages(),
            ]
        ], 200);
    }

    public function getAuditLogs()
    {
        $seller = auth()->guard('seller-api')->user();

        if (!$seller) {
            return response()->json([
                'status' => false,
                'message' => 'Please login',
            ], 401);
        }

        $logs = AuditLog::where('seller_id', $seller->id)
            ->latest()
            ->get();

        return response()->json([
            'status' => true,
            'message' => 'Audit logs retrieved successfully',
            'data' => $logs,
        ]);
    }

    private function recordProductDeletion(Seller $seller, ProductSeller $product): void
    {
        DB::transaction(function () use ($seller, $product): void {
            $product->delete();

            AuditLog::create([
                'seller_id' => $seller->id,
                'action' => 'DELETE_PRODUCT',
                'description' => "Seller ID {$seller->id} deleted product: '{$product->product_name}' (ID: {$product->id})",
            ]);
        });
    }

    private function recordProductUpdate(Seller $seller, ProductSeller $product, array $data): void
    {
        DB::transaction(function () use ($seller, $product, $data): void {
            $product->update($data);

            AuditLog::create([
                'seller_id' => $seller->id,
                'action' => 'UPDATE_PRODUCT',
                'description' => "Seller ID {$seller->id} updated product: '{$product->product_name}' (ID: {$product->id})",
            ]);
        });
    }
}