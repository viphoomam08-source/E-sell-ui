<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Models\Buyer;
use App\Models\Chat;
use Illuminate\Support\Facades\Validator;

class BuyerController extends Controller
{
    public function Buyer_register (Request $request){
        $validated = $request->validate([
            "username" => 'required|string|max:255',
            "email"    => 'required|email|unique:buyers,email', 
            "password" => 'required|min:8' 
        ]);

        $buyers = Buyer::create([
            'username' => $validated['username'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role'     => 'buyer'
        ]);

        $token = auth()->guard('api-buyer')->login($buyers);

        return response()->json([
            "message"      => "register success",
            "buyers"       => $buyers,
            "access_token" => $token,
            "token_type"   => "bearer",
            "expires_in"   => auth()->guard('api-buyer')->factory()->getTTL() * 60
        ]);
    }

    public function buy_login(Request $request){
        $validated = $request->validate([
            "email"    => 'required|email', 
            "password" => 'required|min:8'
        ]);

        $buyers = Buyer::where('email', $validated['email'])->first();
         
        if (!$buyers || !Hash::check($validated['password'], $buyers->password)) {
            return response()->json([
                "message" => "Invalid credentials"
            ], 401);
        }

        $token = auth()->guard('api-buyer')->login($buyers);

        return response()->json([
            "message"      => "login success",
            "buyers"       => $buyers,
            "access_token" => $token,
            "token_type"   => "bearer",
            "expires_in"   => auth()->guard('api-buyer')->factory()->getTTL() * 60
        ], 200);
    }


    public function buyer_acc(Request $request)
    {
        $buyer = auth()->guard('api-buyer')->user();

        if (!$buyer) {
            return response()->json([
                "message" => "Unauthenticated"
            ], 401);
        }

        return response()->json([
            "message" => "Success",
            "data" => $buyer
        ], 200);
    }

    public function buyer_delete(Request $request ,$id){
        $buyer = Buyer::findOrFail($id);
        $buyer->delete();
        return response()->json([
            "message"=>"delete successfully"
        ]);
    }
    public function ManageProfileBuyer (Request $request){
        $buyer = auth()->gauard('buyer-api')->user();
        if(!$buyer){
            return response()->json([
                "statuse"=>fasle,
                "message"=>"please login"

            ]);
        

        }
        return response()->json([
            'message'=>'Your profile ',
            'data'=>$buyer
        ]);
    }
    public function show_info(Request $request){
         $buyer = auth()->guard('api-buyer')->user();
         if(!$buyer){
            return response()->json([
                "message"=>"please login"
            ]);
         }
         $info = Buyer::where('id',$buyer->id)->first();
         return response()->json([
            "messsage"=>"show your info",
            "data"=>$info
         ]);
    }
public function Update_info(Request $request)
    {
        // 1. ឆែកមើលការ Login តាម guard 'api-buyer'
        $buyer = auth()->guard('api-buyer')->user();
        
        if (!$buyer) {
            return response()->json([
                "status" => false,
                "message" => "Please login"
            ], 401);
        }

        // 2.  validate ទិន្នន័យដែលផ្ញើមកពី Frontend
        $request->validate([
            'username' => 'required|string|max:255',
            'email' => 'required|email|max:255',
        ]);

        // 3. ស្វែងរក Buyer តាមរយៈ ID និងធ្វើការ Update
        $buyerInfo = Buyer::where('id', $buyer->id)->first();

        if (!$buyerInfo) {
            return response()->json([
                "status" => false,
                "message" => "Buyer not found"
            ], 404);
        }

        $buyerInfo->update([
            'username' => $request->username,
            'email' => $request->email,
        ]);

        return response()->json([
            "status" => true,
            "message" => "Updated successfully",
            "data" => $buyerInfo
        ], 200);


    }

    public function ChangePassword(Request $request){
        $buyer = auth()->guard('api-buyer')->user();
        if(!$buyer){
        return response()->json([
            "message"=>"please login"
        ]);
        }
       $validator = Validator::make($request->all(), [
            'current_pass' => 'required',
            'new_pass' => 'required|min:6|same:new_password_confirmation', // ផ្លាស់ប្ដូរត្រង់នេះ
            'new_password_confirmation' => 'required'                    // បន្ថែមត្រង់នេះ
        ]);
        if($validator->fails()){
            return response()->json([
                "status"=> false,
                "errors"=>$validator->errors()
            ]);
        }
        if(!Hash::check($request->current_pass,$buyer->password)){
            return response()->json([
            "status" => false,
            "message" => "ពាក្យសម្ងាត់បច្ចុប្បន្នមិនត្រឹមត្រូវទេ"
        ], 400);
        }
        $buyer->password = Hash::make($request->new_pass);
    $buyer->save();
    return response()->json([
        "status" => true,
        "message" => "ផ្លាស់ប្ដូរពាក្យសម្ងាត់បានជោគជ័យ!"
    ], 200);
    }
    public function getMessage(Request $request, $seller_id)
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

    // 2. ឱ្យ Buyer ផ្ញើសារទៅកាន់ Seller
    public function sendMessage(Request $request)
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

        $chat = Chat::create([
            'seller_id' => $validated['seller_id'],
            'buyer_id' => $buyer->id,
            'sender_type' => 'buyer', 
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
    