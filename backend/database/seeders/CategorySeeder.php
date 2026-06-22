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
            // 1. Patient / Age Groups
            ['name' => 'Kids', 'type' => 'age_group'],
            ['name' => 'Adults', 'type' => 'age_group'],
            ['name' => 'Elderly', 'type' => 'age_group'],

            // 2. Therapeutic Categories
            ['name' => 'Antibiotics', 'type' => 'therapeutic'],
            ['name' => 'Vitamins', 'type' => 'therapeutic'],
            ['name' => 'Painkillers', 'type' => 'therapeutic'],
            ['name' => 'Gastrointestinal', 'type' => 'therapeutic'],
            ['name' => 'Cardiovascular', 'type' => 'therapeutic'],
            ['name' => 'Respiratory', 'type' => 'therapeutic'],
            ['name' => 'Skincare', 'type' => 'therapeutic'],
            ['name' => 'Equipment', 'type' => 'therapeutic'],

            // 3. Formulation / Dosage Types
            ['name' => 'Tablets', 'type' => 'formulation'],
            ['name' => 'Capsules', 'type' => 'formulation'],
            ['name' => 'Liquid / Syrup', 'type' => 'formulation'],
            ['name' => 'Injections', 'type' => 'formulation'],
            ['name' => 'Cream / Ointment', 'type' => 'formulation'],
            ['name' => 'Spray / Inhaler', 'type' => 'formulation'],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(
                ['name' => $cat['name']],
                ['type' => $cat['type']]
            );
        }
    }
}
