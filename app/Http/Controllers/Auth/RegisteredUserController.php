<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\SaasTenant;
use App\Models\Campus;
use App\Models\Setting;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(Request $request): Response
    {
        // Prevent tenant domains from accessing register page.
        // Get the main host from APP_URL config
        $mainHost = parse_url(config('app.url'), PHP_URL_HOST);
        $currentHost = $request->getHost();
        
        // If it's a subdomain or different domain, abort.
        if ($mainHost && $currentHost !== $mainHost && $currentHost !== '127.0.0.1' && $currentHost !== 'localhost') {
            abort(404, 'Registration is only available on the main domain.');
        }

        // Fetch dynamic text settings
        $settings = Setting::where('group', 'registration')->whereNull('campus_id')->pluck('value', 'key')->toArray();

        return Inertia::render('Auth/Register', [
            'dynamicText' => [
                'title' => $settings['register_title'] ?? 'Modernize Your School ERP',
                'subtitle' => $settings['register_subtitle'] ?? 'Join hundreds of institutes upgrading their management systems. Sign up today and enjoy a fully-featured 1-Month Free Trial to see how we can transform your campus.',
                'feature_1' => $settings['register_feature_1'] ?? 'Instant Setup',
                'feature_2' => $settings['register_feature_2'] ?? 'Multi-Campus Ready',
                'feature_3' => $settings['register_feature_3'] ?? 'No Credit Card Required',
            ]
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'school_name' => 'required|string|max:255',
            'domain' => 'required|string|max:255|unique:saas_tenants,domain',
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = DB::transaction(function () use ($request) {
            // 1. Create Tenant (1 month free trial)
            $tenant = SaasTenant::create([
                'company_name' => $request->school_name,
                'domain' => $request->domain,
                'admin_email' => $request->email,
                'subscription_plan' => 'Trial',
                'status' => 'Active',
                'valid_until' => now()->addMonth(),
            ]);

            // 2. Create Campus for the Tenant
            $campus = Campus::create([
                'tenant_id' => $tenant->id,
                'name' => $request->school_name,
                'code' => strtoupper(substr(preg_replace('/[^a-zA-Z0-9]/', '', $request->school_name), 0, 3)),
                'is_active' => true,
            ]);

            // 3. Create Admin User for the Campus
            $user = User::create([
                'campus_id' => $campus->id,
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            // 4. Assign 'Tenant Admin' role
            if (\Spatie\Permission\Models\Role::where('name', 'Tenant Admin')->exists()) {
                $user->assignRole('Tenant Admin');
            } else {
                $user->assignRole('Super Admin');
            }

            return $user;
        });

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
