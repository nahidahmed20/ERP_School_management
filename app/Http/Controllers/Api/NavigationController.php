<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\NavigationService;
use Illuminate\Http\JsonResponse;

class NavigationController extends Controller
{
    public function index(NavigationService $nav): JsonResponse
    {
        return response()->json($nav->getMenu());
    }
}
