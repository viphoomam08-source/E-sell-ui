<?php

use App\Http\Controllers\BuyerController;
use App\Http\Controllers\BannerController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\OrderTrackingController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductSellerController;
use App\Http\Controllers\ProductVariantController;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\ProfitController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\SellerController;
use App\Http\Controllers\ShowRecentController;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/login', [RegisterController::class, 'login'])->middleware('throttle:5,1');

Route::middleware('auth:api')->group(function () {
    Route::post('/register', [RegisterController::class, 'Register']);
    Route::get('/diplay', [RegisterController::class, 'Diplay_Customers']);
    Route::post('/product-insert', [ProductController::class, 'Product']);
    Route::delete('/product-delete/{id}', [ProductController::class, 'Delete']);
    Route::put('/product-update/{id}', [ProductController::class, 'Update']);
    Route::get('/product-search', [ProductController::class, 'search_product']);
    Route::delete('/buyer-delete/{id}', [BuyerController::class, 'buyer_delete']);
    Route::post('/category', [CategoryController::class, 'Category_input']);
    Route::get('/reports/today', [ReportController::class, 'TodaySeacrh']);
    Route::get('/reports/yesterday', [ReportController::class, 'YesterdaySearch']);
    Route::get('/reports/monthly', [ReportController::class, 'MonthlySearch']);
    Route::post('/reports/dispatch', [ReportController::class, 'dispatchReport']);
});

Route::get('/product-list', [ProductController::class, 'Product_list']);
Route::get('/show-all', [ProductController::class, 'show_all']);
Route::get('/seller-list', [SellerController::class, 'Seller_list']);
Route::post('/buyer-register', [BuyerController::class, 'Buyer_register'])->middleware('throttle:5,1');
Route::post('/buyer-login', [BuyerController::class, 'buy_login'])->middleware('throttle:5,1');

Route::middleware(['auth:api-buyer'])->group(function () {
    Route::get('/buyer-acc', [BuyerController::class, 'buyer_acc']);
    Route::post('/cart/add', [CartController::class, 'addToCart']);
    Route::get('/cart/items', [CartController::class, 'getCartItems']);
        Route::delete('/cart-delete/{id}', [CartController::class, 'DeleteCart']);

    
    Route::get('show-info',[BuyerController::class,'show_info']);
    Route::put('/update-info',[BuyerController::class,'Update_info']);
    Route::put('/change-password',[BuyerController::class,'ChangePassword']);
    Route::get('/takeSeller',[OrderTrackingController::class,'TakeSeller']);
    Route::get('/buyer/chat-messages/{seller_id}', [ChatController::class, 'buyerGetMessages']);
    Route::post('/buyer/send-message', [ChatController::class, 'buyerSendMessage']);
    Route::post('/track-order', [OrderTrackingController::class, 'store']);
    Route::get('/buyer-orders', [OrderTrackingController::class, 'buyerOrders']);
    Route::get('/order-search', [OrderTrackingController::class, 'searchOrders']);
    Route::get('/display-orders', [OrderTrackingController::class, 'buyerOrders']);
    Route::post('/history',[HistoryController::class,'TakeOrderHistory']);
    Route::delete('/delete-history/{id}',[HistoryController::class,'Delete_histoy']);
    Route::delete('/delete-all',[HistoryController::class,'delete_all']);
    Route::post('/comment',[CommentController::class,'Comment_On_product']);
});

Route::post('/seller-register', [SellerController::class, 'Seller_register'])->middleware('throttle:5,1');
Route::post('/seller-login', [SellerController::class, 'seller_login'])->middleware('throttle:5,1');

Route::middleware('auth:seller-api')->group(function () {
    Route::get('/seller-acc', [SellerController::class, 'seller_acc']);
    Route::post('/product-variants/{productSellerId}', [ProductVariantController::class, 'store']);
    Route::delete('/product-variants/{id}', [ProductVariantController::class, 'destroy']);
    Route::post('/productSell', [ProductSellerController::class, 'ProductSeller']);
    Route::get('/seller-profit',[ProfitController::class,'getSellerProfitOverview']);
    Route::get('/productSell-list', [ProductSellerController::class, 'Show_Product']);
    Route::get('/order-display', [OrderTrackingController::class, 'sellerOrders']);
    Route::delete('/order-delete/{id}', [OrderTrackingController::class, 'deleteOrder']);
    Route::put('/order-status/{id}', [OrderTrackingController::class, 'updateStatus']);
    Route::put('/product-update/{id}', [ProductSellerController::class, 'UpdateProductSell']);
    Route::post('/banner-input',[BannerController::class,'InputBanner']);
    Route::get('/banner-list',[BannerController::class,'BannerList']);
    Route::get('/seller/chat-buyers', [ChatController::class, 'List_buyer']);
    Route::get('/chat-list-product',[ChatController::class,'SendPRoductList']);
    Route::post('/send-message',[ChatController::class,'SendMessage']);
    Route::get('/seller/chat-messages/{buyer_id}', [ChatController::class,'getMessage']);
    Route::get('/alert-stock',[ProductSellerController::class,'Stock_alert']);
    Route::get('/activity/{id}',[ProductSellerController::class,'YourActive']);
    Route::get('/getLog', [ProductSellerController::class, 'getAuditLogs']);
});
Route::get('total-seller', [SellerController::class, 'totalSeller']);
Route::get('/recent-seller', [ShowRecentController::class, 'ShowSeller']);
Route::get('/category-list', [CategoryController::class, 'Category_list']);

Route::get('product-all', [ProductSellerController::class, 'Product_all']);

Route::get('/product/{id}', [ProductSellerController::class, 'show']);
Route::get('/dicount ', [ProductSellerController::class, 'show_dicount']);
Route::get('/top-three-discounts ', [ProductSellerController::class, 'biggest_dicount_of_day']);

Route::get('/product-seller/{sellerId}/{currentProductId}', [ProductSellerController::class, 'relatedBySeller']);
Route::get('/shop-details/{id}', [SellerController::class, 'publicShopDetails']);
Route::get('/shop-variants', [SellerController::class, 'show_variant']);
Route::get('/seller/{sellerId}/biggest-discounts', [ProductSellerController::class, 'seller_biggest_discount']);

Route::get('/seller/{sellerId}/discounts', [ProductSellerController::class, 'show_seller_discount']);

Route::get('/product_no_discount', [ProductSellerController::class, 'show_product_not_discount']);
Route::get('all-products-by-category', [CategoryController::class, 'GetAllProductByCategory']);
Route::get('/track-order/{orderCode}', [OrderTrackingController::class, 'track']);

Route::get('/productSell-list_videos', [ProductSellerController::class, 'show_product_videos']);
Route::delete('/product-delete/{id}', [ProductSellerController::class, 'DeleteProductSell'])->middleware('auth:seller-api');
Route::get('/sellerDiplay',[ProductSellerController::class,'ShowSellerProfile']);
Route::get('/banner-all',[BannerController::class,'BannerAll']);
Route::get('/product-comments/{product_seller_id}', [CommentController::class, 'Diplay_comment']);


Route::post('/search-product',[SearchController::class,'Search_product']);
Route::post('/search-product',[SearchController::class,'Search_product']);


