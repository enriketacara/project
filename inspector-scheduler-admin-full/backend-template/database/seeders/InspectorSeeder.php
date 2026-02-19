<?php

namespace Database\Seeders;

use App\Domain\Inspection\Enums\Location;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class InspectorSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('Password123!');

        // Admin (same login form, role=ADMIN, is_admin=true)
        User::updateOrCreate(['email' => 'admin@company.test'], [
            'name' => 'Admin User',
            'password' => $password,
            'location' => Location::UK->value,
            'timezone' => Location::UK->timezone(),
            'is_admin' => true,
            'role' => 'ADMIN',
            'active' => true,
        ]);

        // Inspectors
        User::updateOrCreate(['email' => 'uk.inspector@company.test'], [
            'name' => 'UK Inspector',
            'password' => $password,
            'location' => Location::UK->value,
            'timezone' => Location::UK->timezone(),
            'is_admin' => false,
            'role' => 'INSPECTOR',
            'active' => true,
        ]);

        User::updateOrCreate(['email' => 'mx.inspector@company.test'], [
            'name' => 'Mexico Inspector',
            'password' => $password,
            'location' => Location::MEXICO->value,
            'timezone' => Location::MEXICO->timezone(),
            'is_admin' => false,
            'role' => 'INSPECTOR',
            'active' => true,
        ]);

        User::updateOrCreate(['email' => 'in.inspector@company.test'], [
            'name' => 'India Inspector',
            'password' => $password,
            'location' => Location::INDIA->value,
            'timezone' => Location::INDIA->timezone(),
            'is_admin' => false,
            'role' => 'INSPECTOR',
            'active' => true,
        ]);
    }
}
