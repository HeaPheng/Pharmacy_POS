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
        Schema::table('items', function (Blueprint $table) {
            $table->string('code')->nullable()->unique()->after('id');
        });

        // Auto-populate codes for existing items using padded sequential IDs
        $items = DB::table('items')->orderBy('id')->get();
        foreach ($items as $item) {
            DB::table('items')->where('id', $item->id)->update([
                'code' => str_pad($item->id, 3, '0', STR_PAD_LEFT)
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('items', function (Blueprint $table) {
            $table->dropColumn('code');
        });
    }
};
