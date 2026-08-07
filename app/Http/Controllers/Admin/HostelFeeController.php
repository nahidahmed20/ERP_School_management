<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{HostelFee, Student, HostelRoom};
use Illuminate\Http\Request;
use Inertia\Inertia;

class HostelFeeController extends Controller
{
    public function index(Request $request)
    {
        $query = HostelFee::with(['student:id,first_name,last_name,admission_no', 'room:id,room_number,hostel_name']);

        if ($search = $request->get('search')) {
            $query->whereHas('student', function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('admission_no', 'like', "%{$search}%");
            });
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        if ($month = $request->get('month')) {
            $query->where('month', $month);
        }

        $fees = $query->latest('year')->latest('month')->paginate(15)->withQueryString();

        return Inertia::render('Admin/Campus/Hostel/Fees/Index', [
            'fees' => $fees,
            'students' => Student::where('is_active', true)->select('id', 'first_name', 'last_name', 'admission_no')->get(),
            'rooms' => HostelRoom::select('id', 'room_number', 'hostel_name')->get(),
            'filters' => [
                'search' => $request->get('search', ''),
                'status' => $request->get('status', ''),
                'month' => $request->get('month', ''),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'hostel_room_id' => 'nullable|exists:hostel_rooms,id',
            'amount' => 'required|numeric|min:1',
            'month' => 'required|string',
            'year' => 'required|integer',
            'status' => 'required|in:Pending,Paid',
            'payment_date' => 'nullable|required_if:status,Paid|date',
            'remarks' => 'nullable|string',
        ]);

        HostelFee::create($validated);
        return back()->with('success', 'Hostel fee record added successfully.');
    }

    public function update(Request $request, $id)
    {
        $fee = HostelFee::findOrFail($id);
        
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'hostel_room_id' => 'nullable|exists:hostel_rooms,id',
            'amount' => 'required|numeric|min:1',
            'month' => 'required|string',
            'year' => 'required|integer',
            'status' => 'required|in:Pending,Paid',
            'payment_date' => 'nullable|required_if:status,Paid|date',
            'remarks' => 'nullable|string',
        ]);

        $fee->update($validated);
        return back()->with('success', 'Hostel fee record updated.');
    }

    public function destroy($id)
    {
        HostelFee::findOrFail($id)->delete();
        return back()->with('success', 'Hostel fee record deleted.');
    }
}