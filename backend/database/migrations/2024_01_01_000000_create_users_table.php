<?php
// ============================================================
// Migration: create_users_table
// File: 2024_01_01_000000_create_users_table.php
// ============================================================
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->bigIncrements('id_user');
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->enum('role', ['pengunjung', 'mahasiswa', 'admin'])->default('pengunjung');
            $table->string('nim', 20)->nullable();
            $table->unsignedBigInteger('id_prodi')->nullable();
            $table->string('foto_profil')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('users'); }
};
