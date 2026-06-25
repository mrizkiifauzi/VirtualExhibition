<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Karya Ditolak — Virtual Exhibition</title>
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

        .card {
            background: #160d2e;
            border: 1px solid #2d1b69;
            border-radius: 20px;
            overflow: hidden;
        }

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

        .warn-box {
            background: rgba(248, 113, 113, 0.1);
            border: 1px solid rgba(248, 113, 113, 0.25);
            border-radius: 10px;
            padding: 14px 16px;
            margin-bottom: 20px;
            font-size: 13px;
            color: #fca5a5;
            line-height: 1.6;
        }

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

        <div class="header">
            <div class="logo-badge">
                <span class="logo-text">Virtual Exhibition</span>
            </div>
        </div>

        <div class="card">

            <div class="banner">
                <span class="banner-icon">❌</span>
                <h1>Karya Ditolak</h1>
                <p>Penolakan karya Anda telah dikirimkan.</p>
            </div>

            <div class="body">
                <p class="greeting">Halo, {{ $user->name }}!</p>

                <p class="message">
                    Kami meninjau karya Anda berjudul <strong>"{{ $artwork->judul }}"</strong> dan memutuskan untuk
                    menolaknya.
                    Berikut alasan penolakannya:
                </p>

                <div class="warn-box">
                    {{ $reason }}
                </div>

                <p class="message">
                    Jika Anda ingin memperbaiki karya ini, silakan tinjau kembali deskripsi dan file yang dikirim
                    kemudian ajukan ulang.
                </p>

                <div class="btn-wrap">
                    <a href="{{ $artworkUrl }}" class="btn">
                        Lihat Detail Karya
                    </a>
                </div>

                <hr class="divider" />

                <p class="note">
                    🛡️ &nbsp;Jika Anda merasa ini keliru, silakan hubungi admin.
                    Email ini dikirim otomatis, mohon jangan membalas pesan ini.
                </p>
            </div>
        </div>

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
