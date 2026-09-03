<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TransportTrackingController;

Route::post('/transport/vehicles/{vehicle}/location',[TransportTrackingController::class,'ingest'])->middleware('throttle:120,1')->name('api.transport.location');
use App\Http\Controllers\Api\NavigationController;
use App\Http\Controllers\Api\BiometricAttendanceController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');



Route::middleware('auth:sanctum')->get('/navigation', [NavigationController::class, 'index']);

Route::post('/attendance-push', BiometricAttendanceController::class)->middleware('throttle:120,1');
