# 💬 "Si Citra" - Microservice AI Chatbot

"Si Citra" adalah asisten portal cerdas untuk Lombok Waste Tracker. Layanan ini dirancang untuk menjembatani celah antara data pemerintah yang kompleks dan pemahaman warga menggunakan Pemrosesan Bahasa Alami (NLP) bahasa Indonesia yang canggih.

---

## 🚀 Ikhtisar

Si Citra bukan sekadar bot FAQ; ia adalah agen interaktif yang memahami konteks regional Indonesia. Si Citra membantu pengguna:

1.  **Memahami Regulasi**: Menjelaskan undang-undang pengelolaan sampah dalam istilah yang sederhana.
2.  **Panduan Pelaporan**: Memberikan instruksi langkah demi langkah tentang cara mengirimkan laporan yang valid.
3.  **Navigasi Situs**: Dapat memicu aksi UI (Portal Tours) atau fokus peta berdasarkan percakapan.
4.  **Konteks Lokal**: Dilatih khusus untuk nuansa bahasa Indonesia (IndoBERT).

---

## 🛠️ Spesifikasi Teknis

- **Model**: IndoBERT (IndoBenchmark)
- **Arsitektur**: Berbasis Transformer Encoder
- **Framework**: FastAPI (Python)
- **Infrastruktur**: Berjalan di `chatbot.juhanda.com`

---

## 🔌 Dokumentasi API

### Kirim Pesan

Memproses kueri pengguna dan mengembalikan respons AI yang terstruktur.

- **Metode**: `POST`
- **URL**: `https://chatbot.juhanda.com/api/chat`
- **Content-Type**: `application/json`

#### Request Payload

```json
{
    "message": "Bagaimana cara saya melapor sampah yang menumpuk?",
    "user_id": "optional_id_for_context"
}
```

#### Contoh Respons

```json
{
    "response": "Halo! Untuk melaporkan sampah, Anda bisa mengklik tombol 'Buat Laporan' di menu navigasi atau klik ikon + pada peta. Pastikan Anda menyertakan foto yang jelas agar tim kami bisa memvalidasinya!",
    "intent": "REPORTING_GUIDE",
    "actions": [{ "type": "SHOW_TOOLTIP", "element": "#report-button" }]
}
```

---

## 🧠 Pipeline NLP

1.  **Preprocessing**: Pembersihan dan normalisasi teks untuk logat/slang Indonesia.
2.  **Embedding**: Vektorisasi teks menggunakan IndoBERT.
3.  **Klasifikasi Intent**: Pemetaan kueri ke aksi sistem tertentu atau entri basis pengetahuan.
4.  **Generasi**: Merumuskan respons seperti manusia berdasarkan intent yang terdeteksi.

---

## 📚 Referensi

- [IndoBenchmark / IndoNLU](https://github.com/indobenchmark/indonlu) - Model pra-latih untuk bahasa Indonesia.
- [Hugging Face Transformers](https://huggingface.co/docs/transformers/index) - Implementasi model inti.
