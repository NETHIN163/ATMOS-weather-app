import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

const API_KEY = process.env.API_KEY;

app.get("/weather", async (req, res) => {
    const { city, lat, lon } = req.query;
    console.log("Weather request:", req.query); // Debugging log

    let url = "";
    if (city) {
        url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    } else if (lat && lon) {
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    } else {
        return res.status(400).json({ error: "Missing parameters (city or lat/lon)" });
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            return res.status(response.status).json({ error: "Weather API Error" });
        }
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Server connection failed" });
    }
});

app.get("/forecast", async (req, res) => {
    const { lat, lon } = req.query;
    console.log("Forecast request:", { lat, lon });

    if (!lat || !lon) {
        return res.status(400).json({ error: "Missing lat/lon for forecast" });
    }

    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            return res.status(response.status).json({ error: "Forecast API Error" });
        }
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Server connection failed" });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});