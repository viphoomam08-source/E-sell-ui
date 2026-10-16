<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\OrderTracking;
use App\Jobs\HistoryJob;

class HistoryController extends Controller
{
    // ១. បង្ហាញប្រវត្តិ (Display History) - រត់ធម្មតា (Synchronous)
    public function TakeOrderHistory(Request $request)
    {
        $buyer = auth()->guard('api-buyer')->user();
        if (!$buyer) {
            return response()->json([
                "status" => false,
                "message" => "please login as buyer"
            ], 401);
        }

        $order_history = OrderTracking::with(['buyer', 'seller', 'product'])
            ->where('status', 'delivered')
            ->where('buyer_id', $buyer->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            "status" => true,
            "message" => "Order history retrieved successfully",
            "data" => $order_history
        ], 200);
    }

    // ២. លុបប្រវត្តិតาม ID ដោយប្រើ Redis Queue
    public function Delete_histoy(Request $request, $id)
    {
        $buyer = auth()->guard('api-buyer')->user();
        if (!$buyer) {
            return response()->json([
                "message" => "please login"
            ], 401);
        }

        // ពិនិត្យមើលថាតើ Order នោះមានពិតប្រាកដដែរឬទេ
        $order = OrderTracking::where('buyer_id', $buyer->id)->where('id', $id)->first();
        if (!$order) {
            return response()->json([
                "status" => false,
                "message" => "រកមិនឃើញប្រវត្តិ Order នេះទេ!"
            ], 404);
        }

        // បញ្ជូនកិច្ចការទៅកាន់ Redis Queue
        HistoryJob::dispatch($buyer->id, $id, 'single');

        return response()->json([
            "status" => true,
            "message" => "សំណើលុបប្រវត្តិ Order ត្រូវបានបញ្ជូនទៅកាន់ Queue (Redis)!"
        ], 200);
    }

    // ៣. លុបប្រវត្តិទាំងអស់ដោយប្រើ Redis Queue
    public function delete_all(Request $request)
    {
        $buyer = auth()->guard('api-buyer')->user();
        if (!$buyer) {
            return response()->json([
                "message" => "please login",
            ], 401);
        }

        // បញ្ជូនកិច្ចការលុបទាំងអស់ទៅកាន់ Redis Queue
        HistoryJob::dispatch($buyer->id, null, 'all');

        return response()->json([
            "status" => true,
            "message" => "សំណើលុបប្រវត្តិ Order ទាំងអស់ត្រូវបានបញ្ជូនទៅកាន់ Queue (Redis)!",
        ], 200);
    }
}