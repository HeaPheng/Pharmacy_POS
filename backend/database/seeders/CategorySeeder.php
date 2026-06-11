<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Seed the categories table with default pharmacy categories.
     */
    public function run(): void
    {
        $categories = [
            'Antibiotics',
            'Vitamins',
            'Painkillers',
            'Skincare',
            'Equipment',
        ];

        foreach ($categories as $name) {
            Category::firstOrCreate(['name' => $name]);
        }
    }
}
