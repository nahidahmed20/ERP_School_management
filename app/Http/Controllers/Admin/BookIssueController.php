<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BookIssue;
use App\Models\Book;
use App\Models\User;
use App\Models\Campus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class BookIssueController extends Controller
{
    public function index(Request $request)
    {
        $query = BookIssue::with(['book', 'user']);

        if ($search = $request->get('search')) {
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%");
            })->orWhereHas('book', function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")->orWhere('isbn_no', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        $query->latest('issue_date');

        $perPage = $request->get('per_page', 10);
        $issues = $perPage === 'all'
            ? ['data' => $query->get(), 'links' => [], 'meta' => ['total' => $query->count()]]
            : $query->paginate((int) $perPage)->withQueryString();

        return Inertia::render('Admin/LibraryIssues/Index', [
            'issues' => $issues,
            'campuses' => Campus::select('id', 'name')->get(),
            'books' => Book::select('id', 'title', 'isbn_no', 'available')->get(),
            'users' => User::select('id', 'name', 'email')->get(), 
            'filters' => $request->only(['search', 'status', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);

        DB::beginTransaction();
        try {
            $book = Book::findOrFail($data['book_id']);
            if ($book->available < 1 && $data['status'] === 'Issued') {
                return back()->with('error', 'এই বইটি বর্তমানে স্টকে নেই!');
            }

            BookIssue::create($data);
            
            if ($data['status'] === 'Issued') {
                $book->decrement('available');
            }

            DB::commit();
            return back()->with('success', 'বই ইস্যু সফলভাবে সম্পন্ন হয়েছে।');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'কোথাও একটি সমস্যা হয়েছে!');
        }
    }

    public function update(Request $request, $id)
    {
        $issue = BookIssue::findOrFail($id);
        $data = $this->validateData($request);
        $oldStatus = $issue->status;

        DB::beginTransaction();
        try {
            $issue->update($data);

            $book = Book::findOrFail($issue->book_id);
            if ($oldStatus === 'Issued' && $data['status'] === 'Returned') {
                $book->increment('available');
            } elseif ($oldStatus === 'Returned' && $data['status'] === 'Issued') {
                $book->decrement('available');
            }

            DB::commit();
            return back()->with('success', 'ইস্যুর তথ্য আপডেট করা হয়েছে।');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'কোথাও একটি সমস্যা হয়েছে!');
        }
    }

    public function destroy($id)
    {
        $issue = BookIssue::findOrFail($id);
        if ($issue->status === 'Issued') {
            Book::where('id', $issue->book_id)->increment('available');
        }
        $issue->delete();
        return back()->with('success', 'ইস্যু রেকর্ড মুছে ফেলা হয়েছে।');
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'book_id' => 'required|exists:books,id',
            'user_id' => 'required|exists:users,id',
            'issue_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:issue_date',
            'return_date' => 'nullable|date|after_or_equal:issue_date',
            'fine_amount' => 'nullable|numeric|min:0',
            'status' => 'required|in:Issued,Returned,Overdue,Lost',
            'note' => 'nullable|string',
        ]);
    }
}