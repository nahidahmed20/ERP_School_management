<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Book;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class BookController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $search = $request->input('search');

        $query = Book::latest();

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('author', 'like', "%{$search}%")
                  ->orWhere('isbn_no', 'like', "%{$search}%")
                  ->orWhere('publisher', 'like', "%{$search}%");
            });
        }

        $books = ($perPage === 'all')
            ? $query->paginate($query->count())->withQueryString()
            : $query->paginate($perPage)->withQueryString();

        return Inertia::render('Admin/Library/Catalogue/Index', [
            'books' => $books,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate($this->validationRules());

        DB::beginTransaction();
        try {
            $data = $request->all();
            $data['available'] = $request->qty;
            Book::create($data);

            DB::commit();
            return back()->with('success', 'Book added to library!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error: ' . $e->getMessage());
        }
    }

    public function update(Request $request, $id)
    {
        $book = Book::findOrFail($id);
        $request->validate($this->validationRules());

        DB::beginTransaction();
        try {
            // Calculate new available qty based on difference
            $difference = $request->qty - $book->qty;
            $newAvailable = $book->available + $difference;

            $data = $request->all();
            $data['available'] = $newAvailable >= 0 ? $newAvailable : 0;

            $book->update($data);

            DB::commit();
            return back()->with('success', 'Book updated!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error: ' . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        Book::findOrFail($id)->delete();
        return back()->with('success', 'Book deleted!');
    }

    private function validationRules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'author' => 'nullable|string|max:255',
            'isbn_no' => 'nullable|string|max:50',
            'publisher' => 'nullable|string|max:255',
            'qty' => 'required|integer|min:1',
            'price' => 'nullable|numeric|min:0',
        ];
    }
}
