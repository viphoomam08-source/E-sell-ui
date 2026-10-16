<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Store a newly created product in storage.
     */
  public function Product(Request $request)
{
    $validated = $request->validate([
        "product_name" => 'required|string|max:255',
        "slug"         => 'required|string|unique:products,slug',
        "decribtion"   => 'required|string', 
        "price"        => 'required|numeric',
        'stock'        => 'required|integer'
    ]);

    $product = Product::create([
        'user_id'      => auth()->guard('api')->id(), 
        'product_name' => $validated['product_name'],
        'slug'         => $validated['slug'],
        'decribtion'   => $validated['decribtion'],
        'price'        => $validated['price'],
        'stock'        => $validated['stock'],
    ]);

    return response()->json([
        "message" => "The Insert Product success",
        "Product" => $product
    ], 201);
}
    public function Product_list(Request $request){
$products = Product::where('user_id', auth()->guard('api')->id())->get(); 
       return response()->json([
            "messsage"=>"list success",
            "product"=>$products
        ]);
    }
    public function Delete( Request $request ,$id){

      $product = Product::findOrFail($id);
      if(!$product){
        return response()->json([
            "messager"=>"user not found"
        ]);
      }
      $product->delete();
      return response()->json([
        "message"=>"Delete success"
      ]);
    }
    public function Update(Request $request, $id)
{
    $product = Product::find($id);
    
    if (!$product) {
        return response()->json([
            "message" => "No product found"
        ], 404);
    }
    
    $validated = $request->validate([
        "product_name" => 'required|string|max:255',
        "slug"         => 'required|string|unique:products,slug,' . $id,
        "decribtion"   => 'required|string', 
        "price"        => 'required|numeric',
        'stock'        => 'required|integer'
    ]);

    $product->product_name = $validated['product_name'];
    $product->slug         = $validated['slug'];
    $product->decribtion   = $validated['decribtion'];
    $product->price        = $validated['price'];
    $product->stock        = $validated['stock']; 
    
    $product->save();

    return response()->json([
        "message" => "Update success",
        "product" => $product
    ]);
}
public function show_all(Request $request){
   $product = Product::all();
   return response()->json([
    "message"=>"list show",
    'product'=>$product
   ]);
}
public function search_product(Request $request)
    {
        $search = $request->input('keyword');

        $products = Product::where('user_id', auth()->guard('api')->id())
            ->where(function($query) use ($search) {
                $query->where('product_name', 'LIKE', "%{$search}%")
                      ->orWhere('decribtion', 'LIKE', "%{$search}%");
            })
            ->get();

        return response()->json([
            "message" => "Search success",
            "product" => $products
        ]);
    }
}