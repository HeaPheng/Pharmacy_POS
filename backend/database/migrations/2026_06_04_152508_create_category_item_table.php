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
        // 1. Create pivot table
        Schema::create('category_item', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->foreignId('item_id')->constrained('items')->onDelete('cascade');
            $table->timestamps();
        });

        // 2. Migrate existing category assignments
        $items = DB::table('items')->select('id', 'category_id')->whereNotNull('category_id')->get();
        foreach ($items as $item) {
            DB::table('category_item')->insert([
                'item_id' => $item->id,
                'category_id' => $item->category_id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 3. Drop category_id constraint and column from items table
        Schema::table('items', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropColumn('category_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Re-add category_id column as nullable to items table
        Schema::table('items', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->constrained('categories')->onDelete('cascade');
        });

        // 2. Migrate category assignments back (assigning the first one if multiple exist)
        $pivots = DB::table('category_item')->orderBy('id')->get();
        foreach ($pivots as $pivot) {
            DB::table('items')
                ->where('id', $pivot->item_id)
                ->whereNull('category_id')
                ->update(['category_id' => $pivot->category_id]);
        }

        // 3. Drop the pivot table
        Schema::dropIfExists('category_item');
    }
};
