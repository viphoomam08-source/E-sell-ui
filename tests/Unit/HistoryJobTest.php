<?php

namespace Tests\Unit;

use App\Jobs\HistoryJob;
use PHPUnit\Framework\TestCase;

class HistoryJobTest extends TestCase
{
    public function test_it_uses_the_redis_history_queue(): void
    {
        $job = new HistoryJob(1);

        $this->assertSame('redis', $job->connection);
        $this->assertSame('history', $job->queue);
    }
}
