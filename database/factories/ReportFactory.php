<?php

namespace Database\Factories;

use App\Models\Report;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Report>
 */
class ReportFactory extends Factory
{
    protected $model = Report::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'description' => $this->faker->paragraph,
            'photo_path' => 'reports/default.jpg',
            'latitude' => $this->faker->latitude,
            'longitude' => $this->faker->longitude,
            'address' => $this->faker->address,
            'status' => 'menunggu',
            'severity_level' => 'low',
            'waste_type' => 'campuran',
        ];
    }
}
