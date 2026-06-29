<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('program_studi', function (Blueprint $table) {
            // add created_at and updated_at
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::table('program_studi', function (Blueprint $table) {
            $table->dropTimestamps();
        });
    }
};
