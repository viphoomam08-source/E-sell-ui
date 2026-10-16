<?php

namespace App\Http\Controllers;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class BannerController extends Controller
{
     public function InputBanner (Request $request){
       $validated = $request->validate([
        'Name'=>'required|string',
'Image_Banner' => 'required|image|mimes:jpeg,png,jpg|max:2048',
       ]);
$imagePath = null;
        if ($request->hasFile('Image_Banner')) {
            $imagePath = $request->file('Image_Banner')->store('banner', 'public');
        }
       $banner = Banner::create([
        'seller_id'=> auth()->guard('seller-api')->id(), 
        'Name'=> $validated['Name'],
        'Image_Banner'=>$imagePath,
       ]);

       return response()->json([
        "message"=>'Hello world',
        "data"=>$banner
       ]);


     }
     public function BannerList (Request $request){
        $perpage = $request->input('per-page',5);
        $bannerlist = Banner::where('seller_id',auth()->guard('seller-api')->id() )->latest()->paginate($perpage);
     return response()->json([
        "message"=>'success',
        "data"=>$bannerlist
     ]);
        
     }


     public function BannerAll(Request $request){
       
        $allBanner = Cache::remember('all_banner',86400,function(){
   return Banner::all();
        });
        return response()->json([
            "message"=>'display',
            "Banner"=>$allBanner
        ]);

     }

}
