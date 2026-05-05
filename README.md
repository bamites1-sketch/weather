# 🌤️ WeatherNow — Real-Time Weather Dashboard

A modern, responsive weather dashboard built with **React**, **Tailwind CSS**, and the **OpenWeatherMap API**.

## ✨ Features

- 🔍 **City search** with debounced input and autocomplete suggestions
- 📍 **Geolocation** — detect your current location automatically
- 🌡️ **Current weather** — temperature, feels like, humidity, wind, pressure, visibility
- ⏱️ **Hourly forecast** — next 24 hours (8 × 3-hour slots)
- 📅 **7-day forecast** — daily high/low with weather icons
- 🕐 **Search history** — last 6 searches, persisted in localStorage
- 🔄 **°C / °F toggle** — auto-refetches with new units
- 🌙 **Dark / Light mode** — persisted in localStorage
- 🎨 **Dynamic backgrounds** — gradient changes based on weather condition
- 💎 **Glassmorphism UI** — frosted glass cards with smooth animations
- 📱 **Mobile-first** — fully responsive layout

## 🚀 Quick Start

### 1. Get an API Key

Sign up for a free key at [openweathermap.org/api](https://openweathermap.org/api).  
The free tier includes Current Weather and 5-day/3-hour Forecast — both used here.

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and replace `your_api_key_here` with your actual key:

```env
VITE_OPENWEATHER_API_KEY=abc123yourkeyhere
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📁 Project Structure

```
weather-dashboard/
├── public/
├── src/
│   ├── components/
│   │   ├── SearchBar.jsx      # Debounced search + autocomplete + history
│   │   ├── WeatherCard.jsx    # Main current weather display
│   │   ├── Forecast.jsx       # Hourly + daily forecast containers
│   │   ├── ForecastItem.jsx   # Individual hourly/daily items
│   │   └── Loader.jsx         # Animated loader + skeleton UI
│   ├── hooks/
│   │   └── useWeather.js      # All weather state & API logic
│   ├── services/
│   │   └── weatherApi.js      # Axios API calls + data parsers
│   ├── utils/
│   │   └── weatherHelpers.js  # Theme mapping, formatters, helpers
│   ├── App.jsx                # Root component + layout
│   ├── main.jsx               # React entry point
│   └── index.css              # Tailwind import + custom scrollbar
├── .env                       # Your API key (not committed)
├── .env.example               # Template
├── index.html
├── vite.config.js
└── package.json
```

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| React 19 | UI framework |
| Tailwind CSS v4 | Styling |
| Framer Motion | Animations |
| Axios | HTTP requests |
| Vite | Build tool |
| OpenWeatherMap API | Weather data |

## 🔑 API Endpoints Used

- `GET /data/2.5/weather` — current weather by city or coords
- `GET /data/2.5/forecast` — 5-day / 3-hour forecast (parsed into daily + hourly)
- `GET /geo/1.0/direct` — city name → coordinates (autocomplete)
- `GET /geo/1.0/reverse` — coordinates → city name

## 📦 Build for Production

```bash
npm run build
npm run preview
```
