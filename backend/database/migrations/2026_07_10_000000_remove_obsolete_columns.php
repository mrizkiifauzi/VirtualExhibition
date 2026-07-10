<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    if (Schema::hasTable('users') && Schema::hasColumn('users', 'foto_profil')) {
      Schema::table('users', function (Blueprint $table) {
        $table->dropColumn('foto_profil');
      });
    }

    if (Schema::hasTable('artworks') && Schema::hasColumn('artworks', 'tahun')) {
      Schema::table('artworks', function (Blueprint $table) {
        $table->dropColumn('tahun');
      });
    }

    if (Schema::hasTable('comments') && Schema::hasColumn('comments', 'updated_at')) {
      Schema::table('comments', function (Blueprint $table) {
        $table->dropColumn('updated_at');
      });
    }
  }

  public function down(): void
  {
    if (Schema::hasTable('users') && !Schema::hasColumn('users', 'foto_profil')) {
      Schema::table('users', function (Blueprint $table) {
        $table->string('foto_profil')->nullable();
      });
    }

    if (Schema::hasTable('artworks') && !Schema::hasColumn('artworks', 'tahun')) {
      Schema::table('artworks', function (Blueprint $table) {
        $table->year('tahun')->nullable();
      });
    }

    if (Schema::hasTable('comments') && !Schema::hasColumn('comments', 'updated_at')) {
      Schema::table('comments', function (Blueprint $table) {
        $table->timestamp('updated_at')->nullable();
      });
    }
  }
};
