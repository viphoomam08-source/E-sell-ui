<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Models\OrderTracking;
use App\Jobs\GenerateReportJob;

class ReportController extends Controller
{
   public function TodaySeacrh(Request $request){
    $today =OrderTracking::whereDate('created_at',Carbon::today())->get();
    return response()->json([
        "message"=>"today's data",
        "data"=>$today
    ]);
   }
   
    public function YesterdaySearch(Request $request){
        $yesterDay = OrderTracking::whereDate('created_at',Carbon::yesterday())->get();
     return response()->json([

        "message"=>"yesterDay",
        "data"=>$yesterDay
     ]);
    
     }
     public function MonthlySearch(Request $request){

        $monthly = OrderTracking::whereMonth('created_at',Carbon::now()->month)
        ->whereYear('created_at',Carbon::now()->year)->get();
        return response()->json([
            "message"=>'Monthly',
            "data"=>$monthly
        ]);
     }
     public function dispatchReport(Request $request)
     {
         $validated = $request->validate([
             'type' => 'required|string|in:today,yesterday,monthly',
         ]);

         $reportType = strtolower(trim($validated['type']));
         GenerateReportJob::dispatch($reportType);

         return response()->json([
             'message' => "The {$reportType} report has been queued successfully.",
             'queue_connection' => config('queue.default'),
         ], 202);
     }
}
