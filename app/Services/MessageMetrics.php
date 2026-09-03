<?php
namespace App\Services;
class MessageMetrics{public static function calculate(string $text,float $rate=0):array{$unicode=(bool)preg_match('/[^\x00-\x7F]/u',$text);$length=mb_strlen($text);$single=$unicode?70:160;$multi=$unicode?67:153;$segments=$length<=$single?1:(int)ceil($length/$multi);return ['unicode'=>$unicode,'characters'=>$length,'segments'=>$segments,'estimated_cost'=>round($segments*$rate,4)];}}
