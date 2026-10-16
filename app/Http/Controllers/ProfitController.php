<?php

namespace App\Http\Controllers;
use App\Models\OrderTracking;
use Illuminate\Http\Request;
use App\Models\ProductSeller;

class ProfitController extends Controller
{
    public function getSellerProfitOverview(Request $request)
    {
        $seller = auth()->guard('seller-api')->user();

        if (! $seller) {
            return response()->json(['status' => false, 'message' => 'Unauthenticated'], 401);
        }

        $productCosts = ProductSeller::where('seller_id', $seller->id)
            ->pluck('product_cost', 'id');
        $sellerProductIds = $productCosts->keys()->map(fn ($id) => (int) $id)->all();
        $orders = OrderTracking::where('status', '!=', 'cancelled')
            ->orderByDesc('created_at')
            ->get();

        $totalRevenue = 0;
        $totalCost = 0;
        $totalItemsSold = 0;
        $dailyBreakdown = [];

        foreach ($orders as $order) {
            $orderItems = collect($order->items ?? [])->filter(function ($item) use ($sellerProductIds) {
                return is_array($item)
                    && in_array((int) ($item['product_id'] ?? 0), $sellerProductIds, true);
            });

            if ($orderItems->isEmpty()) {
                continue;
            }

            $date = $order->created_at->toDateString();
            $dailyBreakdown[$date] ??= [
                'date' => $date,
                'order_count' => 0,
                'items_sold' => 0,
                'revenue' => 0,
                'cost' => 0,
                'profit' => 0,
            ];
            $dailyBreakdown[$date]['order_count']++;

            foreach ($orderItems as $item) {
                $productId = (int) $item['product_id'];
                $quantity = (int) ($item['quantity'] ?? 0);
                $price = (float) ($item['product_price'] ?? 0);
                $cost = (float) ($productCosts->get($productId) ?? 0);
                $revenue = $price * $quantity;
                $itemCost = $cost * $quantity;

                $totalRevenue += $revenue;
                $totalCost += $itemCost;
                $totalItemsSold += $quantity;
                $dailyBreakdown[$date]['items_sold'] += $quantity;
                $dailyBreakdown[$date]['revenue'] += $revenue;
                $dailyBreakdown[$date]['cost'] += $itemCost;
                $dailyBreakdown[$date]['profit'] += $revenue - $itemCost;
            }
        }

        return response()->json([
            'status' => true,
            'message' => 'Profit overview retrieved successfully',
            'data' => [
                'total_orders' => array_sum(array_column($dailyBreakdown, 'order_count')),
                'total_revenue' => round($totalRevenue, 2),
                'total_cost' => round($totalCost, 2),
                'total_profit' => round($totalRevenue - $totalCost, 2),
                'total_items_sold' => $totalItemsSold,
                'daily_breakdown' => array_values(array_map(
                    fn ($day) => [
                        ...$day,
                        'revenue' => round($day['revenue'], 2),
                        'cost' => round($day['cost'], 2),
                        'profit' => round($day['profit'], 2),
                    ],
                    $dailyBreakdown,
                )),
            ],
        ], 200);
    }
}