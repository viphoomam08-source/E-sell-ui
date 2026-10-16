<?php

namespace App\Jobs;

use App\Models\Report;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use InvalidArgumentException;

class GenerateReportJob implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly string $reportType)
    {
        if (! in_array($reportType, ['today', 'yesterday', 'monthly'], true)) {
            throw new InvalidArgumentException("Unsupported report type: {$reportType}");
        }
    }

    public function handle(): void
    {
        match ($this->reportType) {
            'today' => Report::todaySearch(),
            'yesterday' => Report::yesterdaySearch(),
            'monthly' => Report::MonthlySearch(),
        };
    }
}
