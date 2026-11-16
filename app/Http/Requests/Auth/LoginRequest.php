<?php

namespace App\Http\Requests\Auth;

use App\Models\SecurityFailedLogin;
use App\Models\User;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'login' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string'],
            'role' => ['required', 'string', 'in:admin,student,staff,parent'],
            'remember' => ['sometimes', 'boolean'],
            'captcha' => [$this->session()->get('captcha_required') ? 'required' : 'nullable', 'integer'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        if ($this->session()->get('captcha_required') && (int) $this->input('captcha') !== (int) $this->session()->get('captcha_answer')) {
            throw ValidationException::withMessages(['captcha' => 'Incorrect security answer.']);
        }

        $user = $this->resolveUser();

        if (! $user || ! Auth::attempt([
            'email' => $user->email,
            'password' => $this->string('password')->toString(),
        ], $this->boolean('remember')) || ! $this->canAccessPortal($user)) {
            Auth::guard('web')->logout();
            RateLimiter::hit($this->throttleKey());
            $this->recordFailedAttempt();

            throw ValidationException::withMessages([
                'login' => trans('auth.failed'),
            ]);
        }

        RateLimiter::clear($this->throttleKey());
        $this->session()->forget(['captcha_required','captcha_answer','captcha_question']);
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'login' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('login')).'|'.$this->ip());
    }

    private function resolveUser(): ?User
    {
        $login = trim($this->string('login')->toString());
        $normalizedLogin = Str::lower($login);

        return User::query()
            ->whereRaw('LOWER(email) = ?', [$normalizedLogin])
            ->when($this->string('role')->toString() === 'student', function ($query) use ($normalizedLogin) {
                $query->orWhereHas('student', fn ($student) => $student->whereRaw('LOWER(admission_no) = ?', [$normalizedLogin])
                );
            })
            ->when($this->string('role')->toString() === 'staff', function ($query) use ($normalizedLogin) {
                $query->orWhereHas('staff', fn ($staff) => $staff->whereRaw('LOWER(staff_id_no) = ?', [$normalizedLogin])
                );
            })
            ->when($this->string('role')->toString() === 'parent', function ($query) use ($normalizedLogin) {
                $query->orWhereHas('guardian', fn ($guardian) => $guardian->whereRaw('LOWER(guardian_email) = ?', [$normalizedLogin])
                );
            })
            ->first();
    }

    private function canAccessPortal(User $user): bool
    {
        return match ($this->string('role')->toString()) {
            'student' => $user->student()->where('status', true)->exists(),
            'staff' => $user->staff()->where('is_active', true)->exists(),
            'parent' => $user->guardian()->exists(),
            'admin' => $user->roles()
                ->whereNotIn('name', ['student', 'parent'])
                ->exists(),
            default => false,
        };
    }

    private function recordFailedAttempt(): void
    {
            SecurityFailedLogin::create([
            'email_attempted' => trim($this->string('login')->toString()),
            'ip_address' => $this->ip(),
            'user_agent' => Str::limit((string) $this->userAgent(), 65535, ''),
            'attempted_at' => now(),
        ]);
        if (RateLimiter::attempts($this->throttleKey()) >= 3) {
            $a=random_int(1,9);$b=random_int(1,9);
            $this->session()->put(['captcha_required'=>true,'captcha_question'=>"{$a} + {$b} = ?",'captcha_answer'=>$a+$b]);
        }
    }
}
