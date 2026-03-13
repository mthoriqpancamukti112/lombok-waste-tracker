<!DOCTYPE html>
<html>

<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f8fafc;
            padding: 20px;
        }

        .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            max-width: 500px;
            margin: auto;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .otp-box {
            background-color: #f1f5f9;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            color: #334155;
        }

        .footer {
            font-size: 12px;
            color: #94a3b8;
            margin-top: 20px;
        }
    </style>
</head>

<body>
    <div class="container">
        <h2 style="color: #a7e94a;">Pemulihan Kata Sandi</h2>
        <p>Halo,</p>
        <p>Kami menerima permintaan untuk mereset kata sandi akun Anda. Berikut adalah kode OTP Anda:</p>
        <div class="otp-box">{{ $otp }}</div>
        <p>Kode ini hanya berlaku selama <strong>15 menit</strong>. Jangan berikan kode ini kepada siapa pun.</p>
        <p>Jika Anda tidak meminta reset kata sandi, abaikan saja email ini.</p>
        <div class="footer">Terima kasih</div>
    </div>
</body>

</html>
