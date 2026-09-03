<?php
namespace Tests\Unit;use App\Services\MessageMetrics;use PHPUnit\Framework\TestCase;
class MessageMetricsTest extends TestCase{public function test_gsm_and_unicode_segments_are_calculated():void{$this->assertSame(1,MessageMetrics::calculate(str_repeat('a',160))['segments']);$this->assertSame(2,MessageMetrics::calculate(str_repeat('a',161))['segments']);$this->assertTrue(MessageMetrics::calculate('বাংলা')['unicode']);$this->assertSame(2,MessageMetrics::calculate(str_repeat('আ',71))['segments']);}}
