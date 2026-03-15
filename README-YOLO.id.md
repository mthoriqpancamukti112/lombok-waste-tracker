# 🎯 Microservice Deteksi Sampah YOLOv11

Microservice ini menangani tugas deteksi objek berperforma tinggi untuk Lombok Waste Tracker. Layanan ini dibangun menggunakan **YOLOv11** (arsitektur YOLO terbaru) dan dijalankan melalui backend **FastAPI** untuk kecepatan dan konkurensi optimal.

---

## 🚀 Ikhtisar

Tujuan utama dari layanan ini adalah untuk memvalidasi laporan yang dikirimkan oleh warga. Dengan mendeteksi sampah secara otomatis dalam foto yang diunggah, kami dapat:

1.  **Menyaring Gangguan**: Mencegah foto yang tidak terkait sampah memenuhi sistem.
2.  **Kuantifikasi Masalah**: Menghitung jumlah objek sampah (kantong, tumpukan, dll.) untuk menghitung tingkat keparahan.
3.  **Tingkatkan Kualitas Data**: Menyediakan gambar terannotasi (bounding box) untuk dashboard DLH.

---

## 🛠️ Spesifikasi Teknis

- **Model**: YOLOv11 (Ultralytics)
- **Framework**: FastAPI (Python 3.10+)
- **Inference Engine**: PyTorch / TensorRT (pada server GPU)
- **Deployment**: Dockerized, berjalan di `yolo.juhanda.com`

---

## 🔌 Dokumentasi API

### Deteksi Objek Sampah

Menganalisis gambar untuk mendeteksi sampah dan mengembalikan hitungan serta visualisasi.

- **Metode**: `POST`
- **URL**: `https://yolo.juhanda.com/deteksi/`
- **Content-Type**: `multipart/form-data`

#### Request Payload

| Field   | Type   | Deskripsi                              |
| :------ | :----- | :------------------------------------- |
| `image` | `File` | Gambar yang akan dianalisis (JPEG/PNG) |

#### Contoh Respons

```json
{
    "status": "success",
    "jumlah_deteksi": 5,
    "detections": [
        {
            "class": "sampah_plastik",
            "confidence": 0.92,
            "box": [10, 20, 100, 150]
        },
        {
            "class": "sampah_organik",
            "confidence": 0.85,
            "box": [200, 50, 310, 200]
        }
    ],
    "gambar_base64": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDA..."
}
```

---

## 📈 Info Pelatihan Model

Model dilatih secara khusus pada dataset yang dikurasi khusus untuk lingkungan Lombok, termasuk:

- Tumpukan sampah domestik.
- Sampah plastik di area pesisir.
- Tempat pembuangan sampah ilegal di area perkotaan Mataram.

**mAP@0.5 Saat Ini**: ~0.89

---

## 📚 Referensi

- [Dokumentasi Ultralytics YOLO11](https://docs.ultralytics.com/)
- [Dokumentasi FastAPI](https://fastapi.tiangolo.com/)
