<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentGateway;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PaymentGatewayController extends Controller
{
    public function index(Request $request)
    {
        $query = PaymentGateway::query();

        if ($search = $request->search) {
            $query->where('name', 'like', "%{$search}%");
        }

        $gateways = $query->latest()->paginate($request->per_page ?? 10)->withQueryString();

        return Inertia::render('Admin/PaymentsGateways/Index', [
            'gateways' => $gateways,
            'filters' => $request->only(['search', 'per_page'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'api_key' => 'nullable|string|max:255',
            'api_secret' => 'nullable|string|max:255',
            'webhook_secret' => 'nullable|string|max:255',
            'currency' => 'required|string|max:10',
            'mode' => 'required|in:sandbox,live',
            'is_active' => 'required|boolean',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,svg|max:2048',
        ]);

        $data = $request->except('logo');
        $data['slug'] = Str::slug($request->name);

        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('gateways', 'public');
        }

        PaymentGateway::create($data);

        return back()->with('success', 'পেমেন্ট গেটওয়ে সফলভাবে যুক্ত করা হয়েছে!');
    }

    public function update(Request $request, $id)
    {
        $gateway = PaymentGateway::findOrFail($id);
        
        $request->validate([
            'name' => 'required|string|max:255',
            'api_key' => 'nullable|string|max:255',
            'api_secret' => 'nullable|string|max:255',
            'webhook_secret' => 'nullable|string|max:255',
            'currency' => 'required|string|max:10',
            'mode' => 'required|in:sandbox,live',
            'is_active' => 'required|boolean',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,svg|max:2048',
        ]);

        $data = $request->except('logo');
        $data['slug'] = Str::slug($request->name);

        if ($request->hasFile('logo')) {
            if ($gateway->logo && Storage::disk('public')->exists($gateway->logo)) {
                Storage::disk('public')->delete($gateway->logo);
            }
            $data['logo'] = $request->file('logo')->store('gateways', 'public');
        }

        $gateway->update($data);

        return back()->with('success', 'গেটওয়ে আপডেট করা হয়েছে!');
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate(['is_active' => 'required|boolean']);
        
        $gateway = PaymentGateway::findOrFail($id);
        $gateway->update(['is_active' => $request->is_active]);

        return back()->with('success', 'গেটওয়ের স্ট্যাটাস আপডেট করা হয়েছে!');
    }

    public function destroy($id)
    {
        $gateway = PaymentGateway::findOrFail($id);
        
        if ($gateway->logo && Storage::disk('public')->exists($gateway->logo)) {
            Storage::disk('public')->delete($gateway->logo);
        }
        
        $gateway->delete();
        return back()->with('success', 'পেমেন্ট গেটওয়ে মুছে ফেলা হয়েছে!');
    }
}