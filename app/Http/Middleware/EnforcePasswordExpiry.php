<?php
namespace App\Http\Middleware;use Closure;use Illuminate\Http\Request;use Symfony\Component\HttpFoundation\Response;
class EnforcePasswordExpiry{public function handle(Request$r,Closure$next):Response{$u=$r->user();if($u&&$u->password_expires_days&&!$r->routeIs('profile.*','password.*','logout')){$changed=$u->password_changed_at??$u->created_at;if($changed&&$changed->addDays($u->password_expires_days)->isPast())return redirect()->route('profile.edit')->with('error','Your password has expired. Change it before continuing.');}return $next($r);}}
