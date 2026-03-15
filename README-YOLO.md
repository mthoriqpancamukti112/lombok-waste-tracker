# 🎯 YOLOv11 Waste Detection Microservice

This microservice handles the high-performance object detection tasks for the Lombok Waste Tracker. It is built using **YOLOv11** (the latest iteration of the YOLO architecture) and is served via a **FastAPI** backend for optimal speed and concurrency.

---

## 🚀 Overview

The primary goal of this service is to validate reports submitted by citizens. By automatically detecting waste in uploaded photos, we can:

1.  **Filter Noise**: Prevent non-waste related photos from cluttering the system.
2.  **Quantify Issues**: Count the number of waste objects (bags, piles, etc.) to calculate severity.
3.  **Enhance Data Qualtiy**: Provide annotated images (bounding boxes) for the DLH dashboard.

---

## 🛠️ Technical Specifications

- **Model**: YOLOv11 (Ultralytics)
- **Framework**: FastAPI (Python 3.10+)
- **Inference Engine**: PyTorch / TensorRT (on GPU servers)
- **Deployment**: Dockerized, running on `yolo.juhanda.com`

---

## 🔌 API Documentation

### Detect Waste Objects

Analyze an image for waste and return counts and visualization.

- **Method**: `POST`
- **URL**: `https://yolo.juhanda.com/deteksi/`
- **Content-Type**: `multipart/form-data`

#### Request Payload

| Field   | Type   | Description                         |
| :------ | :----- | :---------------------------------- |
| `image` | `File` | The image to be analyzed (JPEG/PNG) |

#### Response Example

```json
{
    "status": "success",
    "jumlah_deteksi": 5,
    "detections": [
        {
            "class": "plastic_waste",
            "confidence": 0.92,
            "box": [10, 20, 100, 150]
        },
        {
            "class": "organic_waste",
            "confidence": 0.85,
            "box": [200, 50, 310, 200]
        }
    ],
    "gambar_base64": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDA..."
}
```

---

## 📈 Model Training Info

The model was custom-trained on a dataset specifically curated for Lombok's environment, including:

- Domestic waste piles.
- Plastic waste in coastal areas.
- Illegal dumping sites in urban Mataram.

**Current mAP@0.5**: ~0.89

---

## 📚 References

- [Ultralytics YOLO11 Documentation](https://docs.ultralytics.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
