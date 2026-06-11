<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Provider;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProviderController extends Controller
{
    /**
     * List all providers.
     */
    public function index()
    {
        $providers = Provider::withCount('items')
            ->with(['stockAdditions' => function ($q) {
                $q->with(['item' => function ($qi) {
                    $qi->with(['categories', 'provider']);
                }])->orderBy('created_at', 'desc');
            }])
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $providers,
        ]);
    }

    /**
     * Create a new provider.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'    => 'required|string|max:255',
            'phone'   => ['nullable', 'string', 'max:50', Rule::unique('providers', 'phone')],
            'address' => 'nullable|string|max:1000',
        ]);

        $provider = Provider::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Provider created successfully.',
            'data' => $provider,
        ], 201);
    }

    /**
     * Update an existing provider.
     */
    public function update(Request $request, Provider $provider)
    {
        $validated = $request->validate([
            'name'    => 'sometimes|required|string|max:255',
            'phone'   => ['nullable', 'string', 'max:50', Rule::unique('providers', 'phone')->ignore($provider->id)],
            'address' => 'nullable|string|max:1000',
        ]);

        $provider->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Provider updated successfully.',
            'data' => $provider,
        ]);
    }

    /**
     * Delete a provider.
     */
    public function destroy(Provider $provider)
    {
        $provider->delete();

        return response()->json([
            'success' => true,
            'message' => 'Provider deleted successfully.',
        ]);
    }
}
