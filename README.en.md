# 🌴 Lombok Waste Tracker & AI Ecosystem

[![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![AI](https://img.shields.io/badge/AI-YOLOv11%20%7C%20IndoBERT-lightgrey?style=for-the-badge&logo=openai)](https://github.com/ultralytics/ultralytics)

**Lombok Waste Tracker** is a modern, community-driven platform designed to tackle waste management issues in Lombok. By leveraging AI-powered validation, interactive mapping, and a gamified experience, we empower citizens to report waste concerns effectively while providing authorities with clear, actionable data.

---

## ✨ Key Features

### 🚀 Smart Waste Reporting

- **AI Validation (YOLOv11)**: Every photo uploaded is instantly scanned by our custom-trained YOLOv11 model to detect and count waste objects, ensuring data validity.
- **Location Precision**: Automatic geolocation and Mapbox-powered location picking for accurate reporting.

### 🤖 "Si Citra" AI Chatbot

- **IndoBERT Powered**: A smart assistant that understands natural language queries about waste management, reporting guides, and service contacts.
- **Dynamic Actions**: Can trigger portal tours and focus on specific report locations on the map.

### 🗺️ Interactive Visualization

- **Heatmaps & Clusters**: Visualize waste density across Lombok using high-performance Mapbox GL layers.
- **Real-time Updates**: Experience seamless data synchronisation between the community and the dashboard.

### 📈 Gamification & Community

- **Waste Points**: Earn points for every validated report and positive interaction.
- **Leaderboard**: Compete to become a "Waste Warrior" and help make Lombok cleaner.
- **Discussion History**: Track your contributions and staff feedback directly from your profile.

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 18 with Inertia.js (Modern Monolith Approach)
- **Styling**: Tailwind CSS & Framer Motion for smooth animations
- **Maps**: Mapbox GL JS & React Map GL
- **Icons**: Mynaui Icons

### Backend

- **Framework**: Laravel 12
- **Auth**: Laravel Breeze & Socialite (Google Login)
- **Database**: MySQL
- **Communication**: WhatsApp Integration (Fonnte API)

### AI Ecosystem

- **Detection**: YOLOv11 running on a Python/FastAPI microservice.
- **NLP**: IndoBERT model for regional context understanding in the chatbot.

---

## 📁 Project Structure

```text
lombok-waste-tracker/
├── app/                  # Laravel backend logic
├── resources/js/         # React frontend components
│   ├── Components/       # Reusable UI parts (Chatbot, Map, Modals)
│   ├── Pages/            # Inertia page views
│   └── Layouts/          # Main application shells
├── public/               # Static assets
└── routes/               # Web & API route definitions

AI Microservices (Located on Server):
├── /projects/yolo       # YOLOv11 Waste Detection API (FastAPI)
└── /projects/chatbot    # IndoBERT Chatbot API (FastAPI)
```

---

## 🚀 Getting Started

### Prerequisites

- **PHP** >= 8.2
- **Node.js** >= 18.x
- **Composer**
- **MySQL**

### Installation

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/your-username/lombok-waste-tracker.git
    cd lombok-waste-tracker
    ```

2.  **Install dependencies**:

    ```bash
    composer install
    npm install
    ```

3.  **Configure environment**:

    ```bash
    cp .env.example .env
    php artisan key:generate
    ```

    _Update your `.env` with your DB credentials, Mapbox token, and AI API URLs._

4.  **Database setup**:

    ```bash
    php artisan migrate --seed
    ```

5.  **Run the development server**:
    ```bash
    # Run everything concurrently (Laravel + Vite + Queues)
    composer dev
    ```

---

## 🔌 API Documentation & Integrations

The system architecture is divided into the main Laravel application and specialized AI microservices.

### Main Application Endpoints
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/map/reports` | Get all waste report pins for the map | Public |
| `GET` | `/api/map/waste-density` | Get heatmap data for waste accumulation | Public |
| `GET` | `/api/statistik-sampah` | Get overall waste analytics and charts | Public |
| `POST` | `/report` | Submit a new waste report with image | Auth |
| `POST` | `/report/{id}/comments` | Submit a comment to a report | Auth |
| `PATCH` | `/report/{id}/status` | Update report status (Staff only) | DLH/Staff |
| `GET` | `/api/user/{id}/poin` | Get current waste points for a specific user | Auth |

### Webhooks & Integration Endpoints
*   **WhatsApp Webhook**: `POST /api/webhooks/whatsapp` - Handles incoming response from the Fonnte gateway.
*   **Google Maps Proxy**: `GET /api/map/places` - Securely queries Google Places API for location searching.

### AI Microservices (FastAPI)
These services are specialized APIs running independently to handle compute-intensive tasks.

#### 🎯 YOLOv11 Waste Detection
*   **Endpoint**: `POST https://yolo.juhanda.com/deteksi/`
*   **Purpose**: Validates if an image contains waste and classifies the type.
*   **Payload**: `multipart/form-data` (file)
*   **Response**: 
    ```json
    {
      "jumlah_deteksi": 5,
      "gambar_base64": "...(annotated image)..."
    }
    ```

#### 💬 "Si Citra" NLP Chatbot
*   **Endpoint**: `POST https://chatbot.juhanda.com/api/chat`
*   **Purpose**: Handles natural language queries using IndoBERT.
*   **Payload**: `{ "message": "cara lapor", "user_id": "12" }`
*   **Response**: `{ "response": "Untuk melapor, silakan klik tombol..." }`

### Third-Party Integrations
*   **Mapbox API**: Vector tiles, geocoding, and interactive map layers.
*   **Google OAuth**: Integrated via Laravel Socialite for seamless citizen login.
*   **Fonnte API**: WhatsApp gateway for sending real-time alerts to residents.

---

## 📚 References & Resources

*   **Object Detection**: [Ultralytics YOLO11](https://github.com/ultralytics/ultralytics) - State-of-the-art real-time detection.
*   **Natural Language**: [IndoBERT (IndoBenchmark)](https://github.com/indobenchmark/indonlu) - Pre-trained language models for Indonesian.
*   **Mapping**: [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/) - Interactive vector maps.
*   **Frontend Components**: [Mynaui Icons](https://mynaui.com/icons) & [Inertia.js](https://inertiajs.com/).
*   **Messaging**: [Fonnte WhatsApp API](https://fonnte.com/).

---

## 🤝 Contributing

We welcome contributions! Please check our issues page for tasks or feel free to submit a Pull Request.

## 📄 License

This project is open-sourced software licensed under the **MIT license**.
