<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('stock_additions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('provider_id')->constrained()->cascadeOnDelete();
            $table->integer('boxes_added');
            $table->decimal('unit_price', 15, 2);
            $table->timestamps();
        });

        // Migrate existing items stock to have an initial transaction log
        $items = DB::table('items')->get();
        foreach ($items as $item) {
            if ($item->boxes_quantity > 0) {
                DB::table('stock_additions')->insert([
                    'item_id' => $item->id,
                    'provider_id' => $item->provider_id,
                    'boxes_added' => $item->boxes_quantity,
                    'unit_price' => $item->unit_price,
                    'created_at' => $item->created_at,
                    'updated_at' => $item->updated_at,
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_additions');
    }
};
