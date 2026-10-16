<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use App\Models\OrderTracking;

class HistoryJob implements ShouldQueue
{
    use Queueable;

    protected $buyerId;
    protected $orderId;
    protected $actionType;

    /**
     * Create a new job instance.
     */
    public function __construct($buyerId, $orderId = null, $actionType = 'single')
    {
        $this->onConnection('database');
        $this->onQueue('history');

        $this->buyerId = $buyerId;
        $this->orderId = $orderId;
        $this->actionType = $actionType; // ទទួលប្រភេទនៃការលុប ('single' ឬ 'all')
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        if ($this->actionType === 'single' && $this->orderId) {
            // លុបប្រវត្តិតាម ID ជាក់លាក់
            OrderTracking::where('buyer_id', $this->buyerId)
                ->where('id', $this->orderId)
                ->delete();
        } elseif ($this->actionType === 'all') {
            // លុបប្រវត្តិទាំងអស់របស់ Buyer នោះ
            OrderTracking::where('buyer_id', $this->buyerId)
                ->delete();
        }
    }
}