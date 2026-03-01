# 🗺️ TMU Walk-Safe
## Adaptive Campus Safety Routing System

> Safety-aware navigation designed for urban campuses.

---

## 🚨 The Problem

Over **80% of students report feeling unsafe walking at night** on urban campuses.

Students regularly navigate:

- High-traffic intersections  
- Crime-prone areas  
- Poorly lit streets  
- Construction zones  
- Low foot-traffic routes  

Most navigation apps optimize for **speed**, not safety.

---

## 💡 The Solution

**Walk-Safe** introduces adaptive, safety-aware routing that dynamically responds to environmental risk factors.

Instead of returning the fastest route, the system prioritizes **safer navigation paths**.

---

## 🧭 What It Does

- 📍 Accepts real start and destination inputs  
- 🗺️ Generates real walking routes  
- 🔴 Detects high-risk zones  
- 🔁 Automatically reroutes around hazards  
- 🌙 Applies higher risk weighting at night  
- ⚠️ Displays live alerts  
- 📊 Calculates a dynamic safety score  

---

## ⚙️ How It Works

1. Converts user input to coordinates using **OpenStreetMap (Nominatim)**  
2. Retrieves walking routes via **OSRM Routing API**  
3. Checks route intersection with predefined hazard zones  
4. Generates detour waypoints when risk is detected  
5. Recalculates safer paths dynamically  
6. Applies night-mode risk multipliers  

---

## ✨ Features

- Dark & Light Map Modes  
- Real-World Walking Routes  
- Visualized Hazard Zones  
- Safety Infrastructure Markers  
- Dynamic Route Recalculation  
- Real-Time Risk Alerts  

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)  
- JavaScript  
- React Leaflet  
- Leaflet.js  

### Mapping & Routing
- OpenStreetMap  
- OSRM Routing API  
- Nominatim Geocoding API  

### Styling
- Roboto (Google Fonts)  
- Custom Dark UI  

---

## 📦 Installation

```bash
git clone https://github.com/yourusername/adaptive-campus-safety.git
cd adaptive-campus-safety
npm install
npm run dev
http://localhost:5173
