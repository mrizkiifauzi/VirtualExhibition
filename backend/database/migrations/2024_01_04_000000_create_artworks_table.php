<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('artworks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_user');
            $table->unsignedBigInteger('id_prodi')->nullable();
            $table->string('judul');
            $table->text('deskripsi')->nullable();
            $table->enum('tipe', ['image', 'video', '3d']);
            $table->string('file_path');
            $table->string('thumbnail')->nullable();
            $table->enum('status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->json('posisi_3d')->nullable(); // {x, y, z, rotation}
            $table->timestamps();

            $table->foreign('id_user')->references('id_user')->on('users')->cascadeOnDelete();
            $table->foreign('id_prodi')->references('id_prodi')->on('program_studi')->nullOnDelete();
        });
    }
    public function down(): void { Schema::dropIfExists('artworks'); }
};
