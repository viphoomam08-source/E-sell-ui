<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    public static function todaySearch()
    {
        return OrderTracking::whereDate('created_at', Carbon::today())->get();
    }

    public static function yesterdaySearch()
    {
        return OrderTracking::whereDate('created_at', Carbon::yesterday())->get();
    }

    public static function MonthlySearch()
    {
        return OrderTracking::whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->get();
    }
}
