<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\NavigationController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');



Route::middleware('auth:sanctum')->get('/navigation', [NavigationController::class, 'index']);

Route::post('/attendance-push', function (Request $request) {
    // $request->all();
    return response()->json(['status' => 'success']);
});
