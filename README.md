# 🐘 WildGuard

**WildGuard** is an human-wildlife conflict monitoring and early warning system. I built this platform to tackle a problem that hits very close to home: the escalating conflict between human communities and wild elephants in India. 

Every year, surprise encounters between people and elephants lead to tragic losses of life, devastated crop yields, and retaliatory harm against endangered wildlife. The fundamental issue isn't malice—it's a lack of awareness and timely communication. People wander into the paths of migrating herds, and herds wander into unprotected farmlands simply because neither knows the other is there until it's too late.

I created WildGuard to bridge this gap. By combining edge AI sensor networks with a centralized command dashboard, forest officials can now monitor forest boundaries in real time and send immediate SMS alerts to nearby villagers the moment an elephant is detected. 

### 🎯 The Goal
The mission of WildGuard is simple: **Defend communities and preserve wildlife.** 
When we remove the element of surprise from these encounters, we protect human lives, safeguard livelihoods, and allow elephants to coexist safely in their natural habitats.

---

## ✨ Features

- **🗺️ Live Monitoring Map:** An interactive, real-time map that tracks edge AI sensor pings and plots historical conflict hotspots to help forest rangers visualize movement corridors.
- **📱 SMS Broadcasting:** A targeted emergency alert system. When an AI node detects an elephant, officials can immediately broadcast SMS warnings to registered villagers in that specific zone.
- **👥 Community Directory:** A robust CRM for managing alert zones. Allows administrators to upload Excel files of village contacts, ensuring everyone in vulnerable areas stays in the loop.
- **📂 Incident Records:** A comprehensive digital ledger for logging, updating, and reviewing past conflict cases and manual field reports.
- **📹 Edge Device Management:** A health dashboard for the physical AI sensors deployed in the field, tracking their operational status, battery levels, and maintenance schedules.
- **📰 Live Intelligence Feed:** An automatically updating news feed pulling the latest national wildlife conflict reports and conservation reforms.

---

## 🛠️ Technology Stack

- **Frontend:** React, Vite, Tailwind CSS, shadcn/ui, Framer Motion, Leaflet Maps
- **Backend:** Node.js, Express.js
- **Database:** Supabase (PostgreSQL)
- **APIs:** NewsAPI (for live wildlife intelligence)

---

## 🚀 Running the Project Locally

1. **Clone the repository**
2. **Install dependencies:**
   ```bash
   npm install
   cd server && npm install
   ```
3. **Configure Environment Variables:**
   Create a `.env` file in the `server` directory with your Supabase and NewsAPI credentials:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   NEWS_API_KEY=your_news_api_key
   PORT=5000
   ```
4. **Start the Development Server:**
   ```bash
   # From the root directory
   npm run dev
   ```
   *This uses `concurrently` to spin up both the Vite frontend and the Node backend simultaneously.*

---

*Built to make a difference. 🌲*