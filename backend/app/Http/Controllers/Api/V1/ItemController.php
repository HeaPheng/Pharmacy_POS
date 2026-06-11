<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ItemController extends Controller
{
    /**
     * List all items with their category and provider.
     */
    public function index(Request $request)
    {
        $query = Item::with(['categories', 'provider']);

        // Optional filtering by category
        if ($request->has('category_id')) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('categories.id', $request->category_id);
            });
        }

        // Optional filtering by provider
        if ($request->has('provider_id')) {
            $query->where('provider_id', $request->provider_id);
        }

        // Optional search by name
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $items = $query->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => $items,
        ]);
    }

    /**
     * Create a new item with optional image upload.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code'           => 'required|string|max:255|unique:items,code',
            'category_ids'   => 'nullable|array',
            'category_ids.*' => 'exists:categories,id',
            'provider_id'   => 'required|exists:providers,id',
            'name'          => 'required|string|max:255',
            'description'   => 'nullable|string|max:2000',
            'image'         => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'boxes_quantity' => 'required|integer|min:0',
            'pieces_per_box' => 'required|integer|min:1',
            'unit_price'    => 'required|numeric|min:0',
        ]);

        $categoryIds = $validated['category_ids'] ?? [];
        unset($validated['category_ids']);

        // Handle image upload
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('items', 'public');
            $validated['image_path'] = $path;
        }

        // Remove the 'image' key since the DB column is 'image_path'
        unset($validated['image']);

        $item = Item::create($validated);
        $item->categories()->sync($categoryIds);

        if ($item->boxes_quantity > 0) {
            \App\Models\StockAddition::create([
                'item_id' => $item->id,
                'provider_id' => $item->provider_id,
                'boxes_added' => $item->boxes_quantity,
                'unit_price' => $item->unit_price,
            ]);
        }

        $item->load(['categories', 'provider']);

        return response()->json([
            'success' => true,
            'message' => 'Item created successfully.',
            'data' => $item,
        ], 201);
    }

    /**
     * Update an existing item.
     */
    public function update(Request $request, Item $item)
    {
        $validated = $request->validate([
            'code'           => 'sometimes|required|string|max:255|unique:items,code,' . $item->id,
            'category_ids'   => 'nullable|array',
            'category_ids.*' => 'exists:categories,id',
            'provider_id'   => 'sometimes|required|exists:providers,id',
            'name'          => 'sometimes|required|string|max:255',
            'description'   => 'nullable|string|max:2000',
            'image'         => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'boxes_quantity' => 'sometimes|required|integer|min:0',
            'pieces_per_box' => 'sometimes|required|integer|min:1',
            'unit_price'    => 'sometimes|required|numeric|min:0',
        ]);

        $categoryIds = $validated['category_ids'] ?? null;
        unset($validated['category_ids']);

        // Handle image upload — delete old image if replacing
        if ($request->hasFile('image')) {
            if ($item->image_path && Storage::disk('public')->exists($item->image_path)) {
                Storage::disk('public')->delete($item->image_path);
            }
            $path = $request->file('image')->store('items', 'public');
            $validated['image_path'] = $path;
        }

        unset($validated['image']);

        $oldBoxesQuantity = $item->boxes_quantity;
        $item->update($validated);

        if ($request->has('boxes_added') && intval($request->boxes_added) > 0) {
            \App\Models\StockAddition::create([
                'item_id' => $item->id,
                'provider_id' => $item->provider_id,
                'boxes_added' => intval($request->boxes_added),
                'unit_price' => $item->unit_price,
            ]);
        } else {
            $diff = $item->boxes_quantity - $oldBoxesQuantity;
            if ($diff > 0) {
                \App\Models\StockAddition::create([
                    'item_id' => $item->id,
                    'provider_id' => $item->provider_id,
                    'boxes_added' => $diff,
                    'unit_price' => $item->unit_price,
                ]);
            }
        }

        if ($categoryIds !== null) {
            $item->categories()->sync($categoryIds);
        }
        $item->load(['categories', 'provider']);

        return response()->json([
            'success' => true,
            'message' => 'Item updated successfully.',
            'data' => $item,
        ]);
    }

    /**
     * Delete an item and its associated image.
     */
    public function destroy(Item $item)
    {
        // Delete the image file if it exists
        if ($item->image_path && Storage::disk('public')->exists($item->image_path)) {
            Storage::disk('public')->delete($item->image_path);
        }

        $item->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item deleted successfully.',
        ]);
    }
}
