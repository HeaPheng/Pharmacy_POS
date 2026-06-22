<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\Invoice;
use App\Models\Provider;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * Get dashboard stats.
     */
    public function stats(): JsonResponse
    {
        $totalInventoryValue = (float) (Item::selectRaw('SUM(unit_price * boxes_quantity) as total')->value('total') ?? 0);
        $totalProductsCount = Item::count();
        $lowStockCount = Item::where('boxes_quantity', '<=', 5)->count();
        $todayInvoicesCount = Invoice::whereDate('created_at', today())->count();
        $todaySalesAmount = (float) (Invoice::whereDate('created_at', today())->sum('total_amount') ?? 0);
        $totalProvidersCount = Provider::count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_inventory_value' => $totalInventoryValue,
                'total_products_count' => $totalProductsCount,
                'low_stock_count' => $lowStockCount,
                'today_invoices_count' => $todayInvoicesCount,
                'today_sales_amount' => $todaySalesAmount,
                'total_providers_count' => $totalProvidersCount,
            ]
        ]);
    }
}
