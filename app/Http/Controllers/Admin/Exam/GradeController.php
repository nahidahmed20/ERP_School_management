<?php

namespace App\Http\Controllers\Admin\Exam;

use App\Http\Controllers\Controller;
use App\Models\Grade;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GradeController extends Controller
{
    public function index()
    {
        $grades = Grade::orderBy('grade_point', 'desc')->get();
        return Inertia::render('Admin/Exams/Grades', ['grades' => $grades]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:10',
            'grade_point' => 'required|numeric|min:0',
            'min_marks' => 'required|numeric|min:0',
            'max_marks' => 'required|numeric|min:0',
            'remarks' => 'nullable|string|max:255',
        ]);

        Grade::create($request->all());

        return back()->with('success', 'Grade created successfully!');
    }

    public function update(Request $request, Grade $grade)
    {
        $request->validate([
            'name' => 'required|string|max:10',
            'grade_point' => 'required|numeric|min:0',
            'min_marks' => 'required|numeric|min:0',
            'max_marks' => 'required|numeric|min:0',
            'remarks' => 'nullable|string|max:255',
        ]);

        $grade->update($request->all());

        return back()->with('success', 'Grade updated successfully!');
    }

    public function destroy(Grade $grade)
    {
        $grade->delete();
        return back()->with('success', 'Grade deleted successfully!');
    }
}
