<?php

namespace App\Http\Controllers;

use App\Events\OrderStatusChanged;
use App\Events\SellerOrderPlaced;
use App\Models\Cart;
use App\Models\OrderTracking;
use App\Models\ProductSeller;
use App\Notifications\OrderStatusUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use App\Models\Buyer;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;

class OrderTrackingController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'shipping_address' => 'required|string',
            'phone' => 'required|string|max:20',
            'note' => 'nullable|string',
        ]);

        $buyer = auth()->guard('api-buyer')->user();

        if (! $buyer) {
            return response()->json([
                'status' => false,
                'message' => 'សូម Login ជាមុនសិន!',
            ], 401);
        }

        $order = DB::transaction(function () use ($buyer, $request) {
            $cartItems = Cart::where('buyer_id', $buyer->id)
                ->with('product')
                ->lockForUpdate()
                ->get();

            if ($cartItems->isEmpty()) {
                throw ValidationException::withMessages([
                    'cart' => 'កន្ត្រកទំនិញរបស់អ្នកទទេរ!',
                ]);
            }

            $totalAmount = 0;
            $formattedItems = [];

            foreach ($cartItems as $item) {
                if (! $item->product) {
                    throw ValidationException::withMessages([
                        'cart' => 'រកមិនឃើញផលិតផលមួយក្នុងកន្ត្រកទំនិញទេ!',
                    ]);
                }
               $sellerName = $item->product->seller ? $item->product->seller->seller_name : 'Admin Store';
                $price = (float) ($item->product->discount_price ?? $item->product->product_price);
                $subtotal = round($price * $item->quantity, 2);
                $totalAmount += $subtotal;

                $formattedItems[] = [
                    'product_id' => $item->product_id,
                    'seller_id' => $item->product->seller_id,
                    'product_name' => $item->product->product_name,
                    'product_price' => $price,
                    'seller_name' => $sellerName,
                    'quantity' => $item->quantity,
                    'subtotal' => $subtotal,
                    'image' => $item->product->image,
                ];
            }

            $order = OrderTracking::create([
                'order_code' => 'ORD-'.strtoupper(uniqid()),
                'buyer_id' => $buyer->id,
                'status' => 'pending',
                'shipping_address' => $request->shipping_address,
                'phone' => $request->phone,
                'total_amount' => round($totalAmount, 2),
                'note' => $request->note,
                'items' => $formattedItems,
            ]);

            Cart::where('buyer_id', $buyer->id)->delete();

            return $order;
        });

        $sellerNotificationsSent = false;
        $sellerItems = collect($order->items ?? [])
            ->filter(fn ($item) => is_array($item)
                && is_numeric($item['seller_id'] ?? null)
                && (int) $item['seller_id'] > 0)
            ->groupBy(fn ($item) => (string) (int) $item['seller_id']);
        $buyerName = $buyer->username ?: $buyer->email;
        $sellerNotificationsSent = $sellerItems->isNotEmpty();

        foreach ($sellerItems as $sellerId => $items) {
            try {
                event(new SellerOrderPlaced(
                    $sellerId,
                    $order->order_code,
                    $order->created_at->toIso8601String(),
                    $buyerName,
                    $items->map(fn ($item) => [
                        'product_name' => $item['product_name'] ?? 'Product',
                        'quantity' => (int) ($item['quantity'] ?? 0),
                    ])->values()->all(),
                ));
            } catch (\Throwable $exception) {
                $sellerNotificationsSent = false;
                report($exception);
            }
        }

        return response()->json([
            'status' => true,
            'message' => 'បានបញ្ជាទិញ និងបង្កើតប្រព័ន្ធតាមដានដោយជោគជ័យ!',
            'seller_notifications_sent' => $sellerNotificationsSent,
            'data' => $order,
        ], 201);
    }

    public function track($orderCode)
    {
        $order = OrderTracking::where('order_code', $orderCode)->first();

        if (! $order) {
            return response()->json([
                'status' => false,
                'message' => 'រកមិនឃើញលេខកូដបញ្ជាទិញនេះទេ!',
            ], 404);
        }

        return response()->json([
            'status' => true,
            'message' => 'រកឃើញព័ត៌មានតាមដានការបញ្ជាទិញ',
            'data' => [
                'order_code' => $order->order_code,
                'status' => $order->status,
                'total_amount' => $order->total_amount,
                'created_at' => $order->created_at,
                'items' => collect($order->items ?? [])
                    ->map(fn ($item) => [
                        'product_name' => $item['product_name'] ?? null,
                        'quantity' => $item['quantity'] ?? null,
                        'subtotal' => $item['subtotal'] ?? null,
                        'image' => $item['image'] ?? null,
                    ])
                    ->values(),
            ],
        ], 200);
    }

    public function buyerOrders(Request $request)
    {
        $buyer = auth()->guard('api-buyer')->user();

        if (! $buyer) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        $orders = OrderTracking::where('buyer_id', $buyer->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'status' => true,
            'message' => 'បញ្ជី Order របស់អ្នក',
            'data' => $orders,
        ], 200);
    }

    public function buyerOrderHistory(Request $request)
    {
        $buyer = auth()->guard('api-buyer')->user();

        if (! $buyer) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        $orders = OrderTracking::where('buyer_id', $buyer->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($order) => [
                'order_id' => $order->id,
                'order_code' => $order->order_code,
                'total_amount' => $order->total_amount,
                'status' => $order->status,
                'shipping_address' => $order->shipping_address,
                'phone' => $order->phone,
                'order_date' => $order->created_at,
                'items' => $order->items,
            ]);

        return response()->json([
            'status' => true,
            'message' => 'Buyer purchase history retrieved successfully',
            'data' => $orders,
        ], 200);
    }

    public function searchOrders(Request $request)
    {
        $buyer = auth()->guard('api-buyer')->user();

        if (! $buyer) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        $keyword = $request->query('keyword', '');
        $orders = OrderTracking::where('buyer_id', $buyer->id)
            ->where(function ($query) use ($keyword) {
                $query->where('id', 'LIKE', "%{$keyword}%")
                    ->orWhere('status', 'LIKE', "%{$keyword}%")
                    ->orWhere('order_code', 'LIKE', "%{$keyword}%");
            })
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'status' => true,
            'data' => $orders,
        ], 200);
    }

    public function destroy($id)
    {
        $buyer = auth()->guard('api-buyer')->user();

        if (! $buyer) {
            return response()->json(['status' => false, 'message' => 'Unauthenticated'], 401);
        }

        $order = OrderTracking::where('buyer_id', $buyer->id)->where('id', $id)->first();

        if (! $order) {
            return response()->json(['status' => false, 'message' => 'រកមិនឃើញ Order នេះ'], 404);
        }

        $order->delete();

        return response()->json(['status' => true, 'message' => 'លុបបានជោគជ័យ']);
    }

    public function sellerOrders(Request $request)
    {
        $seller = auth()->guard('seller-api')->user();

        if (! $seller) {
            return response()->json(['status' => false, 'message' => 'Unauthenticated'], 401);
        }

        $orders = OrderTracking::with([
            'buyer:id,username,email',
            'product:id,seller_id,product_name,product_price,image',
        ])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($order) use ($seller) {
                $items = collect($order->items ?? [])
                    ->filter(fn ($item) => (int) ($item['seller_id'] ?? 0) === (int) $seller->id)
                    ->values();

                if ($items->isEmpty()
                    && (int) ($order->product?->seller_id ?? 0) === (int) $seller->id) {
                    $items = collect([[
                        'product_id' => $order->product->id,
                        'product_name' => $order->product->product_name,
                        'product_price' => $order->product->product_price,
                        'quantity' => null,
                        'subtotal' => null,
                        'image' => $order->product->image,
                    ]]);
                }

                if ($items->isEmpty()) {
                    return null;
                }

                $order->setAttribute('items', $items->all());

                return $order;
            })
            ->filter()
            ->values();

        return response()->json([
            'status' => true,
            'data' => $orders,
        ], 200);
    }
    public function deleteOrder(Request $request, $id)
    {
        $seller = auth()->guard('seller-api')->user();

        if (! $seller) {
            return response()->json(['status' => false, 'message' => 'Unauthenticated'], 401);
        }

        $order = OrderTracking::where('id', $id)->first();

        if (! $order) {
            return response()->json(['status' => false, 'message' => 'រកមិនឃើញ Order នេះទេ!'], 404);
        }

        $sellerOwnsOrder = collect($order->items ?? [])
            ->contains(fn ($item) => (int) ($item['seller_id'] ?? 0) === (int) $seller->id)
            || (int) ($order->product?->seller_id ?? 0) === (int) $seller->id;

        if (! $sellerOwnsOrder) {
            return response()->json(['status' => false, 'message' => 'អ្នកមិនមានសិទ្ធិលុប Order នេះទេ!'], 403);
        }

        $order->delete();

        return response()->json(['status' => true, 'message' => 'លុប Order បានជោគជ័យ!'], 200);
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending,confirmed,shipped,delivered,cancelled',
        ]);

        $seller = auth()->guard('seller-api')->user();

        if (! $seller) {
            return response()->json(['status' => false, 'message' => 'Unauthenticated'], 401);
        }

        $transitions = [
            'pending' => ['confirmed', 'cancelled'],
            'confirmed' => ['shipped', 'cancelled'],
            'shipped' => ['delivered'],
            'delivered' => [],
            'cancelled' => [],
        ];

        [$order, $statusChanged] = DB::transaction(function () use ($id, $seller, $validated, $transitions) {
            $order = OrderTracking::with(['buyer', 'product'])
                ->lockForUpdate()
                ->find($id);

            if (! $order) {
                abort(404, 'រកមិនឃើញ Order នេះទេ!');
            }

            $sellerOwnsOrder = collect($order->items ?? [])
                ->contains(fn ($item) => (int) ($item['seller_id'] ?? 0) === (int) $seller->id)
                || (int) ($order->product?->seller_id ?? 0) === (int) $seller->id;

            if (! $sellerOwnsOrder) {
                abort(403, 'អ្នកមិនមានសិទ្ធិកែប្រែ Order នេះទេ!');
            }

            $statusChanged = $validated['status'] !== $order->status;

            if ($statusChanged && ! in_array($validated['status'], $transitions[$order->status] ?? [], true)) {
                throw ValidationException::withMessages([
                    'status' => "Cannot change order status from {$order->status} to {$validated['status']}.",
                ]);
            }

            if ($order->status !== 'confirmed' && $validated['status'] === 'confirmed') {
                $this->adjustOrderStock($order, -1);
            } elseif ($order->status === 'confirmed' && $validated['status'] === 'cancelled') {
                $this->adjustOrderStock($order, 1);
            }

            if ($statusChanged) {
                $order->status = $validated['status'];
                $order->save();
            }

            return [$order->load('buyer'), $statusChanged];
        });

        $notificationSent = null;
        $liveNotificationSent = null;
        if ($statusChanged) {
            $liveNotificationSent = false;

            try {
                event(new OrderStatusChanged(
                    $order->order_code,
                    $order->status,
                    $order->updated_at->toIso8601String(),
                ));
                $liveNotificationSent = true;
            } catch (\Throwable $exception) {
                report($exception);
            }

            $notificationSent = false;

            $mailer = config('mail.default');

            if ($order->buyer?->email && ! in_array($mailer, ['log', 'array'], true)) {
                try {
                    $order->buyer->notify(new OrderStatusUpdated(
                        $order->order_code,
                        $order->status,
                        $order->buyer->username,
                    ));
                    $notificationSent = true;
                } catch (TransportExceptionInterface $exception) {
                    report($exception);
                }
            } else {
                logger()->warning('Buyer order status email was not sent.', [
                    'order_id' => $order->id,
                    'reason' => $order->buyer?->email ? 'mailer_does_not_deliver_email' : 'buyer_email_missing',
                ]);
            }
        }

        return response()->json([
            'status' => true,
            'notification_sent' => $notificationSent,
            'realtime_notification_sent' => $liveNotificationSent,
            'message' => match (true) {
                ! $statusChanged => 'ស្ថានភាព Order មិនមានការផ្លាស់ប្តូរទេ។',
                $liveNotificationSent && $notificationSent => 'បានកែប្រែស្ថានភាព និងជូនដំណឹងអ្នកទិញភ្លាមៗ។',
                $liveNotificationSent => 'បានកែប្រែស្ថានភាព និងជូនដំណឹងអ្នកទិញភ្លាមៗ។ Email មិនបានផ្ញើទេ។',
                $notificationSent => 'បានកែប្រែស្ថានភាព និងផ្ញើ Email ជូនអ្នកទិញ។ ការជូនដំណឹងផ្ទាល់មិនដំណើរការទេ។',
                default => 'បានកែប្រែស្ថានភាព ប៉ុន្តែការជូនដំណឹងផ្ទាល់មិនដំណើរការទេ។ សូមពិនិត្យ Reverb។',
            },
            'data' => $order,
        ], 200);
    }

    private function adjustOrderStock(OrderTracking $order, int $direction): void
    {
        $quantities = [];

        foreach ($order->items ?? [] as $item) {
            if (! is_array($item)
                || ! isset($item['product_id'], $item['quantity'])
                || ! is_numeric($item['product_id'])
                || ! is_numeric($item['quantity'])
                || (float) $item['product_id'] !== (float) (int) $item['product_id']
                || (float) $item['quantity'] !== (float) (int) $item['quantity']
                || (int) $item['product_id'] < 1
                || (int) $item['quantity'] < 1) {
                throw ValidationException::withMessages([
                    'items' => 'Order items must include a valid product and quantity before confirming.',
                ]);
            }

            $productId = (int) $item['product_id'];
            $quantities[$productId] = ($quantities[$productId] ?? 0) + (int) $item['quantity'];
        }

        if ($quantities === []) {
            throw ValidationException::withMessages([
                'items' => 'This order has no items to update in stock.',
            ]);
        }

        ksort($quantities);
        $products = ProductSeller::whereIn('id', array_keys($quantities))
            ->orderBy('id')
            ->lockForUpdate()
            ->get()
            ->keyBy('id');

        foreach ($quantities as $productId => $quantity) {
            $product = $products->get($productId);

            if (! $product) {
                throw ValidationException::withMessages([
                    'items' => "Product {$productId} on this order no longer exists.",
                ]);
            }

            $newStock = (int) $product->product_stock + ($direction * $quantity);

            if ($newStock < 0) {
                throw ValidationException::withMessages([
                    'stock' => "Not enough stock for {$product->product_name}.",
                ]);
            }

            $product->product_stock = $newStock;
            if ($newStock === 0) {
                $product->status = 'អស់ស្តុក';
            } elseif ($product->status === 'អស់ស្តុក') {
                $product->status = 'មានស្តុក';
            }
            $product->save();
        }
    }

  public function TakeSeller(Request $request)
{
    $buyer = auth()->guard('api-buyer')->user();
    
    if (!$buyer) {
        return response()->json([
            "status" => false,
            "message" => "please login"
        ], 401);
    }
    
    //display seller wheere i buy from
    $sellers = OrderTracking::where('buyer_id', $buyer->id)
                ->with('seller') 
                ->get()->unique('seller_id')->values();

    return response()->json([
        "status" => true,
        "data" => $sellers
    ], 200);

}
}
