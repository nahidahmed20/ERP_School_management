<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{CommunicationChat, User};
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Support\CampusRule;

class CommunicationChatController extends Controller
{
    public function index(Request $request)
    {
        $currentUserId = Auth::id();
        $activeCampusId = config('app.active_campus_id');

        $users = User::where('id', '!=', $currentUserId)
            ->where('campus_id', $activeCampusId)
            ->select('id', 'name', 'email')
            ->get()
            ->map(function ($user) use ($currentUserId) {
                $user->unread_count = CommunicationChat::where('sender_id', $user->id)
                    ->where('receiver_id', $currentUserId)
                    ->where('is_read', false)
                    ->count();
                return $user;
            })
            ->sortByDesc('unread_count')
            ->values();

        $activeUserId = $request->get('user_id');
        $activeUser = null;
        $messages = [];

        if ($activeUserId) {
            $activeUser = User::where('campus_id', $activeCampusId)->find($activeUserId);

            if ($activeUser) {
                CommunicationChat::where('sender_id', $activeUserId)
                    ->where('receiver_id', $currentUserId)
                    ->where('is_read', false)
                    ->update(['is_read' => true]);

                // Fetch chat history between current user and active user
                $messages = CommunicationChat::where(function($q) use ($currentUserId, $activeUserId) {
                        $q->where('sender_id', $currentUserId)->where('receiver_id', $activeUserId);
                    })
                    ->orWhere(function($q) use ($currentUserId, $activeUserId) {
                        $q->where('sender_id', $activeUserId)->where('receiver_id', $currentUserId);
                    })
                    ->orderBy('created_at', 'asc')
                    ->get();
            }
        }

        return Inertia::render('Admin/Communication/Chat/Index', [
            'users' => $users,
            'activeUser' => $activeUser,
            'messages' => $messages,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'receiver_id' => ['required', CampusRule::exists('users')],
            'message' => 'required|string',
        ]);

        CommunicationChat::create([
            'campus_id' => config('app.active_campus_id'),
            'sender_id' => Auth::id(),
            'receiver_id' => $request->receiver_id,
            'message' => $request->message,
            'is_read' => false,
        ]);

        return back();
    }
}