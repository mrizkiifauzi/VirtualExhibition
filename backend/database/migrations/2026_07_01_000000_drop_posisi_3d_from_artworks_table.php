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
    if (Schema::hasColumn('artworks', 'posisi_3d')) {
      Schema::table('artworks', function (Blueprint $table) {
        $table->dropColumn('posisi_3d');
      });
    }
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    if (!Schema::hasColumn('artworks', 'posisi_3d')) {
      Schema::table('artworks', function (Blueprint $table) {
        $table->json('posisi_3d')->nullable();
      });
    }
  }
};
