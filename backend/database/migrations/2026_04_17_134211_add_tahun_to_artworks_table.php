<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // This migration is now obsolete because the 'tahun' column is no longer used.
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No rollback action necessary for the obsolete migration.
    }
};
