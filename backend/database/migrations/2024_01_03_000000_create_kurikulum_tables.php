<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('kurikulum', function (Blueprint $table) {
            $table->bigIncrements('id_kurikulum');
            $table->unsignedBigInteger('id_prodi');
            $table->year('tahun_kurikulum');
            $table->text('deskripsi')->nullable();
            $table->foreign('id_prodi')->references('id_prodi')->on('program_studi')->cascadeOnDelete();
        });

        Schema::create('mata_kuliah', function (Blueprint $table) {
            $table->bigIncrements('id_mk');
            $table->unsignedBigInteger('id_prodi');
            $table->string('kode_mk', 20)->unique();
            $table->string('nama_mk');
            $table->integer('sks');
            $table->foreign('id_prodi')->references('id_prodi')->on('program_studi')->cascadeOnDelete();
        });

        Schema::create('detail_kurikulum', function (Blueprint $table) {
            $table->bigIncrements('id_detail');
            $table->unsignedBigInteger('id_mk');
            $table->unsignedBigInteger('id_kurikulum');
            $table->integer('semester');
            $table->foreign('id_mk')->references('id_mk')->on('mata_kuliah')->cascadeOnDelete();
            $table->foreign('id_kurikulum')->references('id_kurikulum')->on('kurikulum')->cascadeOnDelete();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('detail_kurikulum');
        Schema::dropIfExists('mata_kuliah');
        Schema::dropIfExists('kurikulum');
    }
};
