<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Reset Password</title></head>
<body style="font-family: Arial, sans-serif; background:#f4f4f4; padding:40px;">
  <div style="max-width:500px; margin:auto; background:#fff; border-radius:8px; padding:32px;">
    <h2 style="color:#6d28d9;">Virtual Exhibition</h2>
    <p>Halo, <strong>{{ $user->name }}</strong>!</p>
    <p>Kami menerima permintaan reset password untuk akun Anda. Klik tombol di bawah untuk membuat password baru:</p>
    <a href="{{ $url }}" style="display:inline-block;margin:16px 0;padding:12px 28px;background:#6d28d9;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;">
      Reset Password
    </a>
    <p style="color:#666;font-size:13px;">Link ini akan kedaluwarsa dalam <strong>1 jam</strong>.</p>
    <p style="color:#666;font-size:13px;">Jika Anda tidak meminta reset password, abaikan email ini.</p>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
    <p style="color:#aaa;font-size:12px;">© {{ date('Y') }} Virtual Exhibition — Showcase Karya Mahasiswa</p>
  </div>
</body>
</html>
