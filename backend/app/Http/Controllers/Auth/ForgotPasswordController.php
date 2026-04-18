<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

class ForgotPasswordController extends Controller
{
    /**
     * Step 1 — Verifikasi email + nama, lalu kirim link ke Gmail
     */
    public function sendLink(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'name'  => 'required|string',
        ]);

        // Cari user berdasarkan email DAN nama (verifikasi ganda)
        $user = User::where('email', $request->email)
            ->whereRaw('LOWER(name) = ?', [strtolower(trim($request->name))])
            ->first();

        // Selalu kembalikan pesan sukses meskipun user tidak ditemukan
        // → mencegah user enumerasi (orang lain tidak bisa tahu email terdaftar)
        if (! $user) {
            return response()->json([
                'message' => 'Jika email dan nama cocok, link reset akan dikirim.',
            ]);
        }

        // Hapus token lama milik user ini (jika ada)
        DB::table('password_reset_tokens')
            ->where('email', $user->email)
            ->delete();

        // Buat token baru yang unik
        $plainToken = Str::random(64);

        DB::table('password_reset_tokens')->insert([
            'email'      => $user->email,
            'token'      => Hash::make($plainToken),
            'created_at' => Carbon::now(),
        ]);

        // Kirim notifikasi email ke Gmail pengguna
        $user->notify(new ResetPasswordNotification($plainToken));

        return response()->json([
            'message' => 'Link reset password telah dikirim ke email Anda. Periksa inbox atau folder spam.',
        ]);
    }

    /**
     * Step 2 — Verifikasi token dari link email, lalu ganti password
     */
    public function reset(Request $request)
    {
        $request->validate([
            'token'    => 'required|string',
            'email'    => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Ambil record token dari database
        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        // Validasi: token harus ada dan cocok
        if (! $record || ! Hash::check($request->token, $record->token)) {
            return response()->json([
                'message' => 'Token tidak valid. Silakan minta link baru.',
            ], 422);
        }

        // Validasi: token kedaluwarsa setelah 60 menit
        if (Carbon::parse($record->created_at)->addMinutes(60)->isPast()) {
            DB::table('password_reset_tokens')
                ->where('email', $request->email)
                ->delete();

            return response()->json([
                'message' => 'Link sudah kedaluwarsa (60 menit). Silakan minta ulang.',
            ], 422);
        }

        // Update password user
        $user = User::where('email', $request->email)->first();

        if (! $user) {
            return response()->json(['message' => 'User tidak ditemukan.'], 404);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        // Hapus semua token milik user ini setelah berhasil
        DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->delete();

        // Cabut semua sesi aktif (paksa logout dari semua device)
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Password berhasil diubah. Silakan login dengan password baru.',
        ]);
    }

    /**
     * Step 0 — Cek apakah token masih valid (dipanggil saat halaman reset dibuka)
     */
    public function checkToken(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (! $record || ! Hash::check($request->token, $record->token)) {
            return response()->json(['valid' => false, 'message' => 'Token tidak valid.']);
        }

        if (Carbon::parse($record->created_at)->addMinutes(60)->isPast()) {
            return response()->json(['valid' => false, 'message' => 'Token sudah kedaluwarsa.']);
        }

        return response()->json(['valid' => true]);
    }
}
