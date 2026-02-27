🗺️ TMU Walk-Safe: Adaptive Campus Safety

Over 80% of students report feeling unsafe walking around campus, largely because urban campuses are fully integrated into the surrounding city. Students regularly navigate:

- High-traffic intersections

- Crime-prone areas

- Poorly lit streets

- Construction zones

- Low foot-traffic routes at night

Other navigation apps optimize for speed, not safety.

Adaptive Campus Safety introduces safety-aware routing that dynamically adapts to environmental risk factors.

🗺️ What It Does

This web app:

📍 Accepts real start and destination locations

🗺️ Generates real walking routes

🔴 Detects high-risk zones along the route

🔁 Automatically reroutes around dangerous areas

🌙 Increases risk weighting at night

⚠️ Displays live alerts

📊 Calculates a dynamic safety risk score

Instead of giving the fastest path, the system prioritizes safer navigation through urban campus environments.

🗺️ How It Works

Converts user input into coordinates using OpenStreetMap geocoding

Retrieves walking routes using OSRM

Detects if the route intersects hazard zones

Automatically generates a detour waypoint

Recalculates the route to avoid danger

Applies higher risk multipliers in Night Mode

🗺️ Features

Dark & Light map modes

Real-world walking routes

Visualized hazard zones

Safety infrastructure markers

Dynamic route recalculation

Real-time alert generation

🛠️ Tech Stack

Frontend

React (Vite)

JavaScript

React Leaflet

Leaflet.js

Mapping & Routing

OpenStreetMap

OSRM Routing API

Nominatim Geocoding API

Styling

Roboto (Google Fonts)

Custom dark UI

📦 Installation
git clone https://github.com/yourusername/adaptive-campus-safety.git
cd adaptive-campus-safety
npm install
npm run dev

Open:

http://localhost:5173

🗺️ Why It Matters

Most navigation tools optimize for time.
This system optimizes for safety.

Adaptive Campus Safety demonstrates how routing algorithms can dynamically adapt to environmental risk — transforming navigation into a safety-first experience for urban campuses.
