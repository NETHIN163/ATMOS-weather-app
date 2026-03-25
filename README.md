# 🌦️ ATMOS Weather App

ATMOS is a modern, responsive weather web application that provides real-time weather data and forecasts for any city worldwide.

---

## 🚀 Features

- 🔍 Search weather by city name
- 📍 Get weather using current location (geolocation)
- 🌡️ Real-time temperature, humidity, wind, and pressure
- 📊 5-day weather forecast
- 🌙 Light/Dark theme toggle
- ⚡ Smooth UI with modern design

---

## 🛠️ Tech Stack

### Frontend
- HTML
- CSS
- JavaScript (Vanilla)

### Backend
- Node.js
- Express.js
- OpenWeather API

---


## ⚙️ Setup Instructions

### 🔹 1. Clone the repository

```bash
git clone https://github.com/NETHIN163/ATMOS-weather-app.git
cd ATMOS-weather-app
```
### 🔹 2. Setup Backend
cd Backend
npm install

Create a .env file:

API_KEY=your_openweather_api_key

Run server:

node server.mjs

Server will run on:

http://localhost:5000

### 🔹 3. Setup Frontend

Go to Frontend folder:

cd ../Frontend

Update API URL in script.js:

const BASE_URL = 'http://localhost:5000/weather';
const FORECAST_URL = 'http://localhost:5000/forecast';

Run using live server:

npx live-server



📸 Screenshot
<img width="1665" height="1076" alt="image" src="https://github.com/user-attachments/assets/25ea1906-9511-485c-835c-ea2c06989ca9" />




🤝 Contributing

Feel free to fork this project and improve it!

📜 License

This project is open-source and available under the MIT License.

👨‍💻 Author

Nethin S
