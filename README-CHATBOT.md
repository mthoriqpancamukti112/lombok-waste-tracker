# 💬 "Si Citra" - AI Chatbot Microservice

"Si Citra" is the intelligent portal assistant for the Lombok Waste Tracker. It is designed to bridge the gap between complex government data and citizen understanding using state-of-the-art Indonesian Natural Language Processing (NLP).

---

## 🚀 Overview

Si Citra is not just a FAQ bot; it is an interactive agent that understands regional Indonesian context. It helps users:

1.  **Understand Regulations**: Explains waste management laws in simple terms.
2.  **Guide Reporting**: Provides step-by-step instructions on how to file a valid report.
3.  **Site Navigation**: Can trigger UI actions (Portal Tours) or map focus based on the conversation.
4.  **Local Context**: Trained specifically for Indonesian language nuances (IndoBERT).

---

## 🛠️ Technical Specifications

- **Model**: IndoBERT (IndoBenchmark)
- **Architecture**: Transformer-based Encoder
- **Framework**: FastAPI (Python)
- **Infrastructure**: Running on `chatbot.juhanda.com`

---

## 🔌 API Documentation

### Send Message

Processes a user query and returns a structured AI response.

- **Method**: `POST`
- **URL**: `https://chatbot.juhanda.com/api/chat`
- **Content-Type**: `application/json`

#### Request Payload

```json
{
    "message": "Bagaimana cara saya melapor sampah yang menumpuk?",
    "user_id": "optional_id_for_context"
}
```

#### Response Example

```json
{
    "response": "Halo! Untuk melaporkan sampah, Anda bisa mengklik tombol 'Buat Laporan' di menu navigasi atau klik ikon + pada peta. Pastikan Anda menyertakan foto yang jelas agar tim kami bisa memvalidasinya!",
    "intent": "REPORTING_GUIDE",
    "actions": [{ "type": "SHOW_TOOLTIP", "element": "#report-button" }]
}
```

---

## 🧠 NLP Pipeline

1.  **Preprocessing**: Text cleaning and normalization for Indonesian slang.
2.  **Embedding**: Text vectorization using IndoBERT.
3.  **Intent Classification**: Mapping query to specific system actions or knowledge base entries.
4.  **Generation**: Formulating a human-like response based on the detected intent.

---

## 📚 References

- [IndoBenchmark / IndoNLU](https://github.com/indobenchmark/indonlu) - Pre-trained models for Indonesian.
- [Hugging Face Transformers](https://huggingface.co/docs/transformers/index) - Core model implementation.
