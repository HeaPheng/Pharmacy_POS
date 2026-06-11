<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\StockAddition;
use Illuminate\Http\Request;

class StockAdditionController extends Controller
{
    /**
     * Update a stock addition transaction (specifically provider reassignment).
     */
    public function update(Request $request, StockAddition $stockAddition)
    {
        $validated = $request->validate([
            'provider_id' => 'required|exists:providers,id',
        ]);

        $stockAddition->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Stock log reassigned successfully.',
            'data' => $stockAddition,
        ]);
    }
}
