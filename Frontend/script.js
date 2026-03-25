const BASE_URL = 'http://localhost:5000/weather';
const FORECAST_URL = 'http://localhost:5000/forecast';

let currentCity = '';

const $ = id => document.getElementById(id);
const searchInput = $('searchInput'),
    searchBtn = $('searchBtn'),
    loader = $('loader'),
    errorWrap = $('errorWrap'),
    errorText = $('errorText'),
    emptyState = $('emptyState'),
    weatherCard = $('weatherCard');

$('themeToggle').addEventListener('click', () => {
    document.documentElement.dataset.theme =
        document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
});

searchBtn.addEventListener('click', doSearch);
searchInput.addEventListener('keydown', e => e.key === 'Enter' && doSearch());
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
        const res = await fetch(`${BASE_URL}?city=${encodeURIComponent(city)}`);
        
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'City not found');
        }

        const data = await res.json();
        renderWeather(data);
        fetchForecast(data.coord.lat, data.coord.lon);
    } catch (err) {
        showError(err.message);
    }
}

async function fetchForecast(lat, lon) {
    try {
        const res = await fetch(`${FORECAST_URL}?lat=${lat}&lon=${lon}`);
        if (!res.ok) return;
        const data = await res.json();
        renderForecast(data);
    } catch (err) {
        console.error("Forecast error:", err);
    }
}

function renderWeather(d) {
    $('cityName').textContent = d.name;
    $('countryCode').textContent = d.sys.country;
    $('dateStr').textContent = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    $('tempVal').innerHTML = `${Math.round(d.main.temp)}<span class="temp-unit">°C</span>`;
    $('weatherDesc').textContent = d.weather[0].description;
    $('feelsLike').textContent = `${Math.round(d.main.feels_like)}°C`;
    $('humidityVal').textContent = `${d.main.humidity}%`;
    
    // UX Upgrade: m/s to km/h conversion
    $('windVal').textContent = `${Math.round(d.wind.speed * 3.6)} km/h`;
    
    $('visibilityVal').textContent = d.visibility ? (d.visibility / 1000).toFixed(1) : '—';
    $('pressureVal').textContent = d.main.pressure;

    const isDay = (Date.now() / 1000) > d.sys.sunrise && (Date.now() / 1000) < d.sys.sunset;
    $('weatherIcon').textContent = weatherEmoji(d.weather[0].id, isDay);
    showCard();
}

function renderForecast(data) {
    const container = $('forecastContainer');
    if (!container) return;
    container.innerHTML = '';
    const days = {};
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' });
        if (!days[dayKey] || date.getHours() === 12) days[dayKey] = item;
    });
    Object.entries(days).slice(1, 6).forEach(([label, item]) => {
        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <p>${label}</p>
            <span style="font-size:1.5rem">${weatherEmoji(item.weather[0].id, true)}</span>
            <p>${Math.round(item.main.temp)}°C</p>
        `;
        container.appendChild(card);
    });
}

function weatherEmoji(id, isDay) {
    if (id >= 200 && id < 300) return '⛈️';
    if (id >= 300 && id < 600) return '🌧️';
    if (id >= 600 && id < 700) return '❄️';
    if (id >= 700 && id < 800) return '🌫️';
    if (id === 800) return isDay ? '☀️' : '🌙';
    return '☁️';
}

function showLoader() { loader.classList.add('active'); errorWrap.classList.remove('active'); weatherCard.classList.remove('active'); emptyState.style.display = 'none'; }
function showCard() { loader.classList.remove('active'); weatherCard.classList.add('active'); emptyState.style.display = 'none'; }
function showError(msg) { loader.classList.remove('active'); errorWrap.classList.add('active'); errorText.textContent = msg; weatherCard.classList.remove('active'); emptyState.style.display = 'none'; }
function showEmpty() { loader.classList.remove('active'); errorWrap.classList.remove('active'); weatherCard.classList.remove('active'); emptyState.style.display = 'block'; }

window.addEventListener('DOMContentLoaded', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async pos => {
            showLoader();
            try {
                const { latitude: lat, longitude: lon } = pos.coords;
                const res = await fetch(`${BASE_URL}?lat=${lat}&lon=${lon}`);
                const data = await res.json();
                searchInput.value = data.name;
                currentCity = data.name;
                renderWeather(data);
                fetchForecast(lat, lon);
            } catch { showEmpty(); }
        }, () => showEmpty());
    } else {
        showEmpty();
    }
});