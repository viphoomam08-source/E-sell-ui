<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Seller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class SellerController extends Controller
{
    public function Seller_register(Request $request)
    {
        $validated = $request->validate([
            'seller_name'     => 'required|string|max:255',
            'seller_email'    => 'required|email|unique:sellers,seller_email',
            'seller_password' => 'required|min:8',
            'profile_pic'     => 'required|image|mimes:jpeg,png,jpg|max:2048',
            'Image'           => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'decribe'         => 'nullable|string'
        ]);

        $profilePicPath = null;
        if ($request->hasFile('profile_pic')) {
            $profilePicPath = $request->file('profile_pic')->store('sellers/profiles', 'public');
        }

        $backgroundPath = null;
        if ($request->hasFile('Image')) {
            $backgroundPath = $request->file('Image')->store('sellers/backgrounds', 'public');
        }

        $seller = Seller::create([
            'seller_name'     => $validated['seller_name'],
            'seller_email'    => $validated['seller_email'],
            'seller_password' => Hash::make($validated['seller_password']),
            'profile_pic'     => $profilePicPath,
            'Image'           => $backgroundPath, 
            'decribe'         => $validated['decribe'] ?? null,
            'role'            => 'seller'
        ]);

        $token = auth()->guard('seller-api')->login($seller);

        return response()->json([
            "message"      => "register success",
            "seller"       => $seller,
            "access_token" => $token,
            "token_type"   => "bearer",
            "expires_in"   => auth()->guard('seller-api')->factory()->getTTL() * 60
        ]);
    }

    public function seller_login(Request $request)
    {
        $validated = $request->validate([
            "seller_email"    => 'required|email', 
            "seller_password" => 'required|min:8'
        ]);

        $seller = Seller::where('seller_email', $validated['seller_email'])->first();
         
        if (!$seller || !Hash::check($validated['seller_password'], $seller->seller_password)) {
            return response()->json([
                "message" => "Invalid credentials"
            ], 401);
        }

        $token = auth()->guard('seller-api')->login($seller);

        return response()->json([
            "message"      => "login success",
            "seller"       => $seller,
            "access_token" => $token,
            "token_type"   => "bearer",
            "expires_in"   => auth()->guard('seller-api')->factory()->getTTL() * 60
        ], 200);
    }

    // សម្រាប់គណនីដែលកំពុង Login (Profile ផ្ទាល់ខ្លួន)
    public function seller_acc(Request $request)
    {
        $seller = auth()->guard('seller-api')->user();
        if(!$seller){
            return response()->json([
                 "message" => "Unauthenticated"
                ], 401);
        }
        return response()->json([
            "message" => "Success",
            "data" => $seller
        ], 200);
    }

    // ⭐ API ថ្មី៖ សម្រាប់ទាញយកព័ត៌មានហាង និងទំនិញរបស់ Seller ម្នាក់ៗ (Public Route មិនបាច់ Login)
    public function publicShopDetails($id)
    {
        $seller = Seller::with('products')->find($id);

        if (!$seller) {
            return response()->json([
                "message" => "Shop not found"
            ], 404);
        }

        return response()->json([
            "message" => "Success",
            "seller" => $seller,
            "products" => $seller->products // ទាញយក Products តាម Relation
        ], 200);
    }

    public function Seller_list(Request $request)
    {
         $seller = Seller::all();
         return response()->json([
            "message"=>"seller list",
            "seller"=>$seller
         ]);
    }

    public function seller_delete(Request $request, $id)
    {
        $seller = Seller::findOrFail($id);
        $seller->delete();
        return response()->json([
            "message"=>"success delete",
        ]);
    }

    public function seller_update(Request $request, $id)
    {
        // បន្ថែម Logic កែប្រែតាមតម្រូវការ
    }

    public function seller_search(Request $request)
    {   
        $search = $request->input('keyword');
        $sellerId = auth()->guard('seller-api')->id();

        $seller = \App\Models\ProductSeller::where('seller_id', $sellerId)
            ->where(function($query) use ($search) {
                $query->where('product_name', 'LIKE', "%{$search}%")
                      ->orWhere('product_description', 'LIKE', "%{$search}%");
            })
            ->get();

        return response()->json([
            "message" => "Search success",
            "seller" => $seller
        ]); 
    }

    public function totalSeller(Request $request)
    {
        $TotalSellers = Seller::count();
        return response()->json([
            'total' => $TotalSellers
        ]);
    }
}