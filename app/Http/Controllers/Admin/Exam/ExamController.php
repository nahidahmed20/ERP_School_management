<?php

namespace App\Http\Controllers\Admin\Exam;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExamController extends Controller
{
    public function index(Request $request)
    {
        $query = Exam::query()->orderBy('start_date', 'desc');

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        return Inertia::render('Admin/Exams/Index', [
            'exams' => $query->paginate(15)->withQueryString(),
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', ''),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        Exam::create($data);

        return back()->with('success', 'পরীক্ষা সফলভাবে তৈরি করা হয়েছে।');
    }

    public function update(Request $request, $id)
    {
        $exam = Exam::findOrFail($id);
        $data = $this->validateData($request);
        $exam->update($data);

        return back()->with('success', 'পরীক্ষার তথ্য আপডেট করা হয়েছে।');
    }

    public function destroy($id)
    {
        $exam = Exam::findOrFail($id);

        try {
            $exam->delete();
        } catch (QueryException $e) {
            return back()->with('error', 'এই পরীক্ষার সাথে শিডিউল বা অন্য তথ্য যুক্ত আছে, তাই ডিলিট করা যাচ্ছে না। আগে সংশ্লিষ্ট শিডিউল মুছে ফেলুন।');
        }

        return back()->with('success', 'পরীক্ষা মুছে ফেলা হয়েছে।');
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'campus_id' => 'nullable|exists:campuses,id',
            'name' => 'required|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);
    }
}