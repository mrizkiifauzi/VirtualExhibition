<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Password — Virtual Exhibition</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #0f0a1e;
            padding: 40px 16px;
            color: #e2e8f0;
        }

        .wrapper {
            max-width: 520px;
            margin: 0 auto;
        }

        /* Header */
        .header {
            text-align: center;
            margin-bottom: 24px;
        }

        .logo-badge {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            background: #1e0a3c;
            border: 1px solid #4c1d95;
            border-radius: 12px;
            padding: 10px 20px;
        }

        .logo-icon {
            width: 32px;
            height: 32px;
            background: #6d28d9;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 14px;
            color: #fff;
            line-height: 1;
        }

        .logo-text {
            font-size: 15px;
            font-weight: 700;
            color: #fff;
            letter-spacing: -0.3px;
        }

        /* Card */
        .card {
            background: #160d2e;
            border: 1px solid #2d1b69;
            border-radius: 20px;
            overflow: hidden;
        }

        /* Purple gradient banner */
        .banner {
            background: linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, #7c3aed 100%);
            padding: 36px 40px;
            text-align: center;
        }

        .banner-icon {
            font-size: 48px;
            margin-bottom: 12px;
            display: block;
        }

        .banner h1 {
            font-size: 22px;
            font-weight: 700;
            color: #fff;
            margin-bottom: 6px;
        }

        .banner p {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.75);
        }

        /* Body */
        .body {
            padding: 32px 40px;
        }

        .greeting {
            font-size: 16px;
            font-weight: 600;
            color: #e2e8f0;
            margin-bottom: 12px;
        }

        .message {
            font-size: 14px;
            color: #94a3b8;
            line-height: 1.7;
            margin-bottom: 28px;
        }

        /* CTA Button */
        .btn-wrap {
            text-align: center;
            margin-bottom: 28px;
        }

        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #6d28d9, #7c3aed);
            color: #fff !important;
            text-decoration: none;
            font-size: 15px;
            font-weight: 700;
            padding: 14px 36px;
            border-radius: 12px;
            letter-spacing: 0.2px;
        }

        /* Warning box */
        .warn-box {
            background: rgba(234, 179, 8, 0.08);
            border: 1px solid rgba(234, 179, 8, 0.25);
            border-radius: 10px;
            padding: 14px 16px;
            margin-bottom: 20px;
            font-size: 13px;
            color: #fbbf24;
            line-height: 1.6;
        }

        .warn-box strong {
            color: #f59e0b;
        }

        /* URL fallback */
        .url-box {
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 10px 14px;
            margin-bottom: 24px;
        }

        .url-label {
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin-bottom: 6px;
        }

        .url-link {
            font-size: 11px;
            color: #a78bfa;
            word-break: break-all;
            line-height: 1.5;
        }

        /* Divider */
        .divider {
            border: none;
            border-top: 1px solid #1e1b4b;
            margin: 0 0 20px;
        }

        .note {
            font-size: 12px;
            color: #475569;
            line-height: 1.6;
        }

        /* Footer */
        .footer {
            text-align: center;
            margin-top: 24px;
            font-size: 12px;
            color: #334155;
            line-height: 1.7;
        }

        .footer a {
            color: #6d28d9;
            text-decoration: none;
        }
    </style>
</head>

<body>
    <div class="wrapper">

        <!-- Logo -->
        <div class="header">
            <div class="logo-badge">
                <div class="logo-icon">VE</div>
                <span class="logo-text">Virtual Exhibition</span>
            </div>
        </div>

        <!-- Card -->
        <div class="card">

            <!-- Banner -->
            <div class="banner">
                <span class="banner-icon">🔐</span>
                <h1>Reset Password</h1>
                <p>Permintaan reset password diterima</p>
            </div>

            <!-- Body -->
            <div class="body">

                <p class="greeting">Halo, {{ $user->name }}!</p>

                <p class="message">
                    Kami menerima permintaan untuk mereset password akun Virtual Exhibition Anda
                    (<strong style="color:#a78bfa;">{{ $user->email }}</strong>).<br /><br />
                    Klik tombol di bawah untuk membuat password baru Anda:
                </p>

                <!-- CTA Button -->
                <div class="btn-wrap">
                    <a href="{{ $resetUrl }}" class="btn">
                        🔑 &nbsp;Reset Password Saya
                    </a>
                </div>

                <!-- Warning -->
                <div class="warn-box">
                    ⏰ &nbsp;<strong>Link ini hanya berlaku selama 60 menit</strong> sejak email ini dikirim.
                    Setelah itu Anda perlu meminta link baru.
                </div>

                <!-- URL Fallback -->
                <div class="url-box">
                    <p class="url-label">Atau salin link ini ke browser:</p>
                    <a href="{{ $resetUrl }}" class="url-link">{{ $resetUrl }}</a>
                </div>

                <hr class="divider" />

                <p class="note">
                    🛡️ &nbsp;Jika Anda tidak merasa meminta reset password, abaikan email ini.
                    Akun Anda tetap aman dan tidak ada yang berubah.<br /><br />
                    Email ini dikirim otomatis, mohon jangan membalas pesan ini.
                </p>

            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>© {{ date('Y') }} Virtual Exhibition — Showcase Karya Mahasiswa</p>
            <p style="margin-top:4px;">
                Butuh bantuan?
                <a href="mailto:{{ config('mail.from.address') }}">Hubungi Admin</a>
            </p>
        </div>

    </div>
</body>

</html>
