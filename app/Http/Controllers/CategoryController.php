<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;

class CategoryController extends Controller
{
    public function Category_input(Request $request)
    {
        $validated = $request->validate([
            'parent_id'      => 'nullable|exists:categories,id', 
            'category_name'  => 'required|string|max:255',
            'image_category' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        $Image_cate_path = null;
        if ($request->hasFile('image_category')) {
            $Image_cate_path = $request->file('image_category')->store('categories/profiles', 'public');
        }

        $category = Category::create([
            'parent_id'      => $request->input('parent_id'), 
            'user_id'        => auth()->guard('api')->id(),
            'category_name'  => $validated['category_name'],
            'image_category' => $Image_cate_path 
        ]);

        return response()->json([
            'message'  => 'success input',
            'category' => $category
        ]);
    }

    public function Category_list(Request $request)
    {
$category = Category::with('children')->whereNull('parent_id')->get();
        return response()->json([
            "message" => "list category", 
            'list'    => $category
        ]);
    }
    public function GetAllProductByCategory(Request $request){
        $category = Category::with(['products'=>function($query){

        }])->has('products')->get();
        return response()->json([
            "message" => "list category with product",
            'list'    => $category
        ]); 
    }
}