<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    /**
     * List all invoices with buyer info and item count.
     */
    public function index()
    {
        $invoices = Invoice::with(['buyer', 'invoiceItems.item.categories'])
            ->withCount('invoiceItems')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $invoices,
        ]);
    }

    /**
     * Show a single invoice with full details (buyer, line items, item info).
     */
    public function show(Invoice $invoice)
    {
        $invoice->load(['buyer', 'invoiceItems.item.categories']);

        return response()->json([
            'success' => true,
            'data' => $invoice,
        ]);
    }

    /**
     * Create a new invoice with line items and deduct stock.
     *
     * Expected payload:
     * {
     *   "buyer_id": 1,               // nullable — omit for walk-in
     *   "invoice_number": "INV-0001",
     *   "items": [
     *     {
     *       "item_id": 3,
     *       "quantity_boxes": 2,
     *       "quantity_pieces": 5
     *     }
     *   ]
     * }
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'buyer_id'                => 'nullable|exists:buyers,id',
            'invoice_number'          => 'required|string|unique:invoices,invoice_number',
            'items'                   => 'required|array|min:1',
            'items.*.item_id'         => 'required|exists:items,id',
            'items.*.quantity_boxes'  => 'required|integer|min:0',
            'items.*.quantity_pieces' => 'required|integer|min:0',
        ]);

        // Wrap in a transaction to ensure atomicity
        $invoice = DB::transaction(function () use ($validated) {
            $totalAmount = 0;
            $lineItems = [];

            foreach ($validated['items'] as $lineItem) {
                $item = Item::findOrFail($lineItem['item_id']);

                // Calculate total pieces requested
                $requestedBoxes  = $lineItem['quantity_boxes'];
                $requestedPieces = $lineItem['quantity_pieces'];
                $totalPiecesRequested = ($requestedBoxes * $item->pieces_per_box) + $requestedPieces;

                // Check available stock in total pieces
                $availablePieces = $item->boxes_quantity * $item->pieces_per_box;
                if ($totalPiecesRequested > $availablePieces) {
                    throw new \Exception(
                        "Insufficient stock for item \"{$item->name}\". " .
                        "Available: {$item->boxes_quantity} boxes ({$availablePieces} pieces). " .
                        "Requested: {$requestedBoxes} boxes + {$requestedPieces} pieces ({$totalPiecesRequested} pieces)."
                    );
                }

                // Calculate subtotal
                $subtotal = $totalPiecesRequested * $item->unit_price;
                $totalAmount += $subtotal;

                // Deduct stock: convert remaining pieces back to boxes
                $remainingPieces = $availablePieces - $totalPiecesRequested;
                $item->boxes_quantity = intdiv($remainingPieces, $item->pieces_per_box);
                $item->save();

                $lineItems[] = [
                    'item_id'         => $item->id,
                    'quantity_boxes'  => $requestedBoxes,
                    'quantity_pieces' => $requestedPieces,
                    'unit_price'      => $item->unit_price,
                    'subtotal'        => $subtotal,
                ];
            }

            // Create the invoice
            $invoice = Invoice::create([
                'buyer_id'       => $validated['buyer_id'] ?? null,
                'invoice_number' => $validated['invoice_number'],
                'total_amount'   => $totalAmount,
            ]);

            // Create line items
            foreach ($lineItems as $line) {
                $invoice->invoiceItems()->create($line);
            }

            return $invoice;
        });

        $invoice->load(['buyer', 'invoiceItems.item']);

        return response()->json([
            'success' => true,
            'message' => 'Invoice created successfully.',
            'data' => $invoice,
        ], 201);
    }
}
