<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{CommunicationChat, User};
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class CommunicationChatController extends Controller
{
    public function index(Request $request)
    {
        $currentUserId = Auth::id();

        // Fetch all users except the currently logged-in user
        // You can filter this by role (e.g., only Admins/Teachers) if needed
        $users = User::where('id', '!=', $currentUserId)->select('id', 'name', 'email')->get();

        $activeUserId = $request->get('user_id');
        $activeUser = null;
        $messages = [];

        if ($activeUserId) {
            $activeUser = User::find($activeUserId);

            // Mark messages as read
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

        return Inertia::render('Admin/Communication/Chat/Index', [
            'users' => $users,
            'activeUser' => $activeUser,
            'messages' => $messages,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'message' => 'required|string',
        ]);

        CommunicationChat::create([
            'sender_id' => Auth::id(),
            'receiver_id' => $request->receiver_id,
            'message' => $request->message,
            'is_read' => false,
        ]);

        // Returns back to the same page, Inertia handles the smooth update
        return back();
    }
}
