# 🌴 Lombok Waste Tracker & Ekosistem AI

[![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![AI](https://img.shields.io/badge/AI-YOLOv11%20%7C%20IndoBERT-lightgrey?style=for-the-badge&logo=openai)](https://github.com/ultralytics/ultralytics)

**Lombok Waste Tracker** adalah platform modern berbasis komunitas yang dirancang untuk mengatasi masalah pengelolaan sampah di Lombok. Dengan memanfaatkan validasi berbasis AI, pemetaan interaktif, dan pengalaman gamifikasi, kami memberdayakan warga untuk melaporkan masalah sampah secara efektif sekaligus memberikan data yang jelas dan siap tindak bagi pihak berwenang.

---

## ✨ Fitur Utama

### 🚀 Pelaporan Sampah Pintar

- **Validasi AI (YOLOv11)**: Setiap foto yang diunggah dipindai secara instan oleh model YOLOv11 kami untuk mendeteksi dan menghitung objek sampah, memastikan validitas data.
- **Presisi Lokasi**: Geolokasi otomatis dan pemilihan lokasi berbasis Mapbox untuk pelaporan yang akurat.

### 🤖 "Si Citra" AI Chatbot

- **Bertenaga IndoBERT**: Asisten pintar yang memahami kueri bahasa alami tentang pengelolaan sampah, panduan pelaporan, dan kontak layanan.
- **Aksi Dinamis**: Dapat memicu tur portal dan fokus pada lokasi laporan tertentu di peta.

### 🗺️ Visualisasi Interaktif

- **Heatmap & Cluster**: Visualisasikan kepadatan sampah di seluruh Lombok menggunakan lapisan Mapbox GL berkinerja tinggi.
- **Pembaruan Real-time**: Sinkronisasi data yang mulus antara komunitas dan dashboard.

### 📈 Gamifikasi & Komunitas

- **Poin Sampah**: Dapatkan poin untuk setiap laporan yang divalidasi dan interaksi positif.
- **Leaderboard**: Berkompetisi untuk menjadi "Pejuang Sampah" dan membantu membuat Lombok lebih bersih.
- **Riwayat Diskusi**: Pantau kontribusi Anda dan umpan balik staf langsung dari profil Anda.

---

## 🛠️ Stack Teknologi

### Frontend

- **Framework**: React 18 dengan Inertia.js (Pendekatan Monolith Modern)
- **Styling**: Tailwind CSS & Framer Motion untuk animasi yang halus
- **Maps**: Mapbox GL JS & React Map GL
- **Icons**: Mynaui Icons

### Backend

- **Framework**: Laravel 12
- **Auth**: Laravel Breeze & Socialite (Login Google)
- **Database**: MySQL
- **Komunikasi**: Integrasi WhatsApp (API Fonnte)

### Ekosistem AI

- **Deteksi**: YOLOv11 berjalan pada microservice Python/FastAPI.
- **NLP**: Model IndoBERT untuk pemahaman konteks regional pada chatbot.

---

## 🔌 Dokumentasi API & Integrasi

Arsitektur sistem dibagi menjadi aplikasi Laravel utama dan microservice AI khusus.

### Endpoint Aplikasi Utama

| Metode  | Endpoint                 | Deskripsi                                           | Akses    |
| :------ | :----------------------- | :-------------------------------------------------- | :------- |
| `GET`   | `/api/map/reports`       | Ambil semua pin laporan sampah untuk peta           | Publik   |
| `GET`   | `/api/map/waste-density` | Ambil data heatmap akumulasi sampah                 | Publik   |
| `GET`   | `/api/statistik-sampah`  | Ambil analitik dan grafik sampah secara keseluruhan | Publik   |
| `POST`  | `/report`                | Kirim laporan sampah baru dengan gambar             | Auth     |
| `POST`  | `/report/{id}/comments`  | Kirim komentar ke laporan                           | Auth     |
| `PATCH` | `/report/{id}/status`    | Perbarui status laporan (Hanya Staf)                | DLH/Staf |
| `GET`   | `/api/user/{id}/poin`    | Ambil poin sampah saat ini untuk pengguna tertentu  | Auth     |

### Microservice AI (FastAPI)

Layanan ini adalah API khusus yang berjalan secara independen untuk menangani tugas-tugas intensif komputasi.

#### 🎯 Deteksi Sampah YOLOv11

- **Endpoint**: `POST https://yolo.juhanda.com/deteksi/`
- **Tujuan**: Memvalidasi apakah sebuah gambar mengandung sampah dan mengklasifikasikan jenisnya.
- **Payload**: `multipart/form-data` (file)
- **Respons**:
    ```json
    {
        "jumlah_deteksi": 5,
        "gambar_base64": "...(annotated image)..."
    }
    ```

#### 💬 Chatbot NLP "Si Citra"

- **Endpoint**: `POST https://chatbot.juhanda.com/api/chat`
- **Tujuan**: Menangani kueri bahasa alami menggunakan IndoBERT.
- **Payload**: `{ "message": "cara lapor", "user_id": "12" }`
- **Respons**: `{ "response": "Untuk melapor, silakan klik tombol..." }`

### Integrasi Pihak Ketiga

- **API Mapbox**: Vector tiles, geocoding, dan lapisan peta interaktif.
- **Google OAuth**: Terintegrasi melalui Laravel Socialite untuk login warga yang mulus.
- **API Fonnte**: Gateway WhatsApp untuk mengirim peringatan real-time kepada warga.

---

## 📚 Referensi & Sumber Daya

- **Deteksi Objek**: [Ultralytics YOLO11](https://github.com/ultralytics/ultralytics) - Deteksi real-time tercanggih.
- **Bahasa Alami**: [IndoBERT (IndoBenchmark)](https://github.com/indobenchmark/indonlu) - Model bahasa pra-latih untuk konteks Indonesia.
- **Pemetaan**: [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/) - Peta vektor interaktif.
- **Komponen Frontend**: [Mynaui Icons](https://mynaui.com/icons) & [Inertia.js](https://inertiajs.com/).
- **Komunikasi**: [Fonnte WhatsApp API](https://fonnte.com/).

---

## 🚀 Memulai

### Prasyarat

- **PHP** >= 8.2
- **Node.js** >= 18.x
- **Composer**
- **MySQL**

### Instalasi

1.  **Clone repository**:

    ```bash
    git clone https://github.com/username-anda/lombok-waste-tracker.git
    cd lombok-waste-tracker
    ```

2.  **Instal dependensi**:

    ```bash
    composer install
    npm install
    ```

3.  **Konfigurasi lingkungan**:

    ```bash
    cp .env.example .env
    php artisan key:generate
    ```

    _Update .env Anda dengan kredensial DB, token Mapbox, dan URL API AI._

4.  **Setup Database**:

    ```bash
    php artisan migrate --seed
    ```

5.  **Jalankan server pengembangan**:
    ```bash
    # Jalankan semuanya secara bersamaan (Laravel + Vite + Queue)
    composer dev
    ```

---

## 🤝 Kontribusi

Kami menyambut kontribusi! Silakan periksa halaman issue untuk tugas atau jangan ragu untuk mengirimkan Pull Request.

## 📄 Lisensi

Proyek ini adalah perangkat lunak sumber terbuka yang dilisensikan di bawah **lisensi MIT**.
