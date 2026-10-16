<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Register;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class RegisterController extends Controller
{
     public function Register(Request $request)
    {
       $validated = $request->validate([
    'name' => 'required|string|max:255',
    'email' => 'required|email|unique:users,email',
    'password' => 'required|string|min:8',
]);
        $user = Register::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);
 $token = auth()->guard('api')->login($user);
        return response()->json([
            "message"      => 'Register success',
            "data"         => $user,
            "access_token" => $token,
            "token_type"   => "bearer",
            "expires_in"   => auth()->guard('api')->factory()->getTTL() * 60
        ], 201);
    }
    

    public function Diplay_Customers(Request $r){
        $user  =  Register::all();
        return response()->json([
            "message"=>"diplay",
            "data"=>$user
        ]);
    }
  public function login(Request $request)
    {
        $validated = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = Register::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                "message" => "Invalid credentials"
            ], 401);
        }

        $token = auth()->guard('api')->login($user);

        return response()->json([
            "message"      => "Login success",
            "data"         => $user,
            "access_token" => $token,
            "token_type"   => "bearer",
            "expires_in"   => auth()->guard('api')->factory()->getTTL() * 60
        ], 200);
    }
    
}
