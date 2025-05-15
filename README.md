# 🌡️ IoT Temperature Dashboard

A fullstack IoT app built with **NestJS**, **Next.js**, **MQTT**, and **Docker** — designed to receive, simulate, and visualize live temperature sensor data in real time.

---

## 🧩 Stack

- **Backend:** NestJS + MQTT client
- **Frontend:** Next.js (App Router) + Tailwind CSS + WebSocket
- **MQTT Broker:** External (test.mosquitto.org / broker.hivemq.com)
- **Deployment:** Docker, Nginx, Certbot, Ubuntu 22.04

---

## ✅ Features

### 📡 Backend (NestJS)
- Connects to MQTT broker (`sensors/temperature`)
- In-memory storage of latest readings per device
- REST API:
  - `GET /temperature` → all readings
  - `GET /temperature/:deviceId` → specific reading
  - `POST /simulate` → send mock reading
  - `GET /health` → MQTT connection status
- WebSocket Gateway:
  - Emits new data to clients on every MQTT message

### 💻 Frontend (Next.js)
- Live-updating table of temperature data (via WebSocket)
- Simulate button → triggers backend mock data
- Device search → fetches current reading via REST
- Styled with TailwindCSS

---

## 🛠 Local Development

### 1. Clone the repo

```bash
git clone <your-repo>
cd <your-project>
