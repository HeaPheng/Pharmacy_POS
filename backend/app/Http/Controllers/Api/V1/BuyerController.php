<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Buyer;
use Illuminate\Http\Request;

class BuyerController extends Controller
{
    /**
     * List all non-walk-in buyers (for dropdowns / autocomplete).
     */
    public function index(Request $request)
    {
        $query = Buyer::where('is_walkin', false);

        // Optional search by name or phone
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $buyers = $query->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => $buyers,
        ]);
    }

    /**
     * Create a new buyer.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'phone'    => 'nullable|string|max:50|unique:buyers,phone',
            'is_walkin' => 'sometimes|boolean',
        ]);

        $buyer = Buyer::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Buyer created successfully.',
            'data' => $buyer,
        ], 201);
    }
}
