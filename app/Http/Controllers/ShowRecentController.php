<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Models\Seller;

class ShowRecentController extends Controller
{
    public function ShowSeller(Request $request)
    {
        $sellers = Seller::whereDate('created_at', Carbon::today())->get();
        
        if ($sellers->isNotEmpty()) {
            return response()->json([
                'sellers' => $sellers, // លុបសញ្ញា $ ចោលនៅទីនេះ
            ], 200);
        }

        return response()->json([
            'sellers' => [],
            'message' => 'no sellers found for today'
        ], 200);
    }
}