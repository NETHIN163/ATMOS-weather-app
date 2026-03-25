const API_KEY = '0faee197d8ed4f43f763ca327ca49a0d';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

let currentCity = '';

const $ = id => document.getElementById(id);
const searchInput = $('searchInput'),
    searchBtn = $('searchBtn');
const loader = $('loader'),
    errorWrap = $('errorWrap'),
    errorText = $('errorText');
const emptyState = $('emptyState'),
    weatherCard = $('weatherCard');

$('themeToggle').addEventListener('click', () => {
    document.documentElement.dataset.theme =
        document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
});

searchBtn.addEventListener('click', doSearch);
searchInput.addEventListener('keydown', e => e.key === 'Enter' && doSearch());
searchInput.addEventListener('input', () => {
    if (searchInput.value.trim() === '') {
        currentCity = '';
        showEmpty();
    }
});
$('refreshBtn').addEventListener('click', () => currentCity && fetchWeather(currentCity));

function doSearch() {
    const q = searchInput.value.trim();
    if (!q) return;
    currentCity = q;
    fetchWeather(q);
}

async function fetchWeather(city) {
    showLoader();
    try {
        const res = await fetch(`${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`);

        if (!res.ok) {
            throw new Error(res.status === 404 ? 'City not found. Please try again.' : 'Something went wrong. Try later.');
        }

        const data = await res.json();
        renderWeather(data);
        fetchForecast(city);

    } catch (err) {
        showError(err.message);
    }
}

// FIX 1: fetchForecast now calls renderForecast instead of just console.logging
async function fetchForecast(city) {
    try {
        const res = await fetch(`${FORECAST_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`);
        if (!res.ok) return;
        const data = await res.json();
        renderForecast(data);
    } catch (err) {
        console.error("Forecast error:", err);
    }
}

// FIX 2: Added missing renderForecast function
// The API returns 3-hour intervals; we pick one entry per day (noon slot preferred)
function renderForecast(data) {
    const container = $('forecastContainer');
    if (!container) return;
    container.innerHTML = '';

    // Group forecast entries by day, pick the midday entry (or first available)
    const days = {};
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
        const hour = date.getHours();
        // Prefer entries around noon (11–14h), otherwise take first of the day
        if (!days[dayKey] || (hour >= 11 && hour <= 14)) {
            days[dayKey] = item;
        }
    });

    // Skip today, show next 5 days
    const entries = Object.entries(days).slice(1, 6);

    entries.forEach(([label, item]) => {
        const temp = Math.round(item.main.temp);
        const desc = item.weather[0].description;
        const code = item.weather[0].id;
        const isDay = item.sys.pod === 'd';
        const emoji = weatherEmoji(code, isDay);

        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <p>${label}</p>
            <span style="font-size:1.6rem;line-height:1">${emoji}</span>
            <p>${temp}°C</p>
            <p>${desc}</p>
        `;
        container.appendChild(card);
    });
}

function renderWeather(d) {
    $('cityName').textContent = d.name;
    $('countryCode').textContent = d.sys.country;
    $('dateStr').textContent = formatDate();
    $('tempVal').innerHTML = `${Math.round(d.main.temp)}<span class="temp-unit">°C</span>`;
    $('weatherDesc').textContent = d.weather[0].description;
    $('feelsLike').textContent = `${Math.round(d.main.feels_like)}°C`;
    $('humidityVal').textContent = `${d.main.humidity}%`;
    $('humiditySub').textContent = humidLabel(d.main.humidity);
    $('windVal').textContent = `${Math.round(d.wind.speed)} m/s`;
    $('windSub').textContent = windLabel(d.wind.speed);
    $('visibilityVal').textContent = d.visibility ? (d.visibility / 1000).toFixed(1) : '—';
    $('pressureVal').textContent = d.main.pressure;

    const code = d.weather[0].id;
    const isDay = isNowDay(d.sys.sunrise, d.sys.sunset);
    $('weatherIcon').textContent = weatherEmoji(code, isDay);
    setBackground(code, isDay);
    showCard();
}

function formatDate() {
    return new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function humidLabel(h) {
    return h < 30 ? 'Dry' : h < 60 ? 'Comfortable' : h < 80 ? 'Humid' : 'Very Humid';
}

function windLabel(s) {
    return s < 2 ? 'Calm' : s < 8 ? 'Light Breeze' : s < 14 ? 'Moderate' : s < 20 ? 'Strong' : 'Storm';
}

function isNowDay(rise, set) {
    const now = Date.now() / 1000;
    return now > rise && now < set;
}

function weatherEmoji(id, isDay) {
    if (id >= 200 && id < 300) return '⛈️';
    if (id >= 300 && id < 400) return '🌦️';
    if (id >= 500 && id < 510) return '🌧️';
    if (id === 511) return '🌨️';
    if (id >= 511 && id < 600) return '🌧️';
    if (id >= 600 && id < 700) return '❄️';
    if (id >= 700 && id < 800) return '🌫️';
    if (id === 800) return isDay ? '☀️' : '🌙';
    if (id === 801) return isDay ? '🌤️' : '🌙';
    if (id === 802) return '⛅';
    return '☁️';
}

const BG_IDS = ['bgNight', 'bgClearDay', 'bgCloudy', 'bgRain', 'bgSnow', 'bgThunder', 'bgFog'];

function setBackground(id, isDay) {
    let t = 'bgNight';
    if (!isDay) t = 'bgNight';
    else if (id >= 200 && id < 300) t = 'bgThunder';
    else if (id >= 300 && id < 600) t = 'bgRain';
    else if (id >= 600 && id < 700) t = 'bgSnow';
    else if (id >= 700 && id < 800) t = 'bgFog';
    else if (id === 800) t = 'bgClearDay';
    else if (id >= 801) t = 'bgCloudy';

    BG_IDS.forEach(b => {
        const el = $(b);
        if (el) el.style.opacity = b === t ? '1' : '0';
    });

    const lightning = $('lightning');
    if (lightning) lightning.style.display = t === 'bgThunder' ? 'block' : 'none';

    clearParticles();
    if (t === 'bgRain' || t === 'bgThunder') spawnRain();
    else if (t === 'bgSnow') spawnSnow();
    else spawnParticles();
}

function clearParticles() { $('particles').innerHTML = ''; }

function spawnRain() {
    const c = $('particles');
    for (let i = 0; i < 60; i++) {
        const d = document.createElement('div');
        d.className = 'raindrop';
        d.style.left = (Math.random() * 100) + 'vw';
        d.style.animationDuration = (0.5 + Math.random() * .7) + 's';
        d.style.animationDelay = (Math.random() * 2) + 's';
        d.style.opacity = .3 + Math.random() * .5;
        c.appendChild(d);
    }
}

function spawnSnow() {
    const c = $('particles'), fl = ['❄', '❅', '❆', '✻', '*'];
    for (let i = 0; i < 30; i++) {
        const f = document.createElement('div');
        f.className = 'snowflake';
        f.textContent = fl[Math.floor(Math.random() * fl.length)];
        f.style.left = (Math.random() * 100) + 'vw';
        f.style.fontSize = (.6 + Math.random()) + 'rem';
        f.style.animationDuration = (3 + Math.random() * 5) + 's';
        f.style.animationDelay = (Math.random() * 5) + 's';
        c.appendChild(f);
    }
}

function spawnParticles() {
    const c = $('particles');
    for (let i = 0; i < 15; i++) {
        const p = document.createElement('div');
        const s = 4 + Math.random() * 10;
        p.className = 'particle';
        p.style.cssText = `width:${s}px;height:${s}px;left:${Math.random() * 100}vw;animation-duration:${6 + Math.random() * 8}s;animation-delay:${Math.random() * 6}s;`;
        c.appendChild(p);
    }
}

function showLoader() {
    loader.classList.add('active');
    errorWrap.classList.remove('active');
    weatherCard.classList.remove('active');
    // FIX 3: Use consistent display toggling for emptyState
    emptyState.style.display = 'none';
}

function showCard() {
    loader.classList.remove('active');
    errorWrap.classList.remove('active');
    void weatherCard.offsetWidth;
    weatherCard.classList.add('active');
    emptyState.style.display = 'none';
}

function showError(msg) {
    loader.classList.remove('active');
    errorWrap.classList.add('active');
    errorText.textContent = msg;
    weatherCard.classList.remove('active');
    emptyState.style.display = 'none';
}

// FIX 4: showEmpty now explicitly sets display and hides other states
function showEmpty() {
    loader.classList.remove('active');
    errorWrap.classList.remove('active');
    weatherCard.classList.remove('active');
    emptyState.style.display = 'block';
}

window.addEventListener('DOMContentLoaded', () => {
    spawnParticles();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async pos => {
            showLoader();
            try {
                const { latitude: lat, longitude: lon } = pos.coords;
                const res = await fetch(`${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
                if (!res.ok) throw new Error();
                const data = await res.json();
                searchInput.value = data.name;
                currentCity = data.name;
                renderWeather(data);
                fetchForecast(data.name);
            } catch { showEmpty(); }
        }, () => { showEmpty(); });
    } else {
        showEmpty();
    }
});