// Free OpenWeatherMap API key (for demo/assignment use)
// Get your own free key at: https://openweathermap.org/api
const API_KEY = 'f50e49e8e4781d1f5f5a72e9c3e48d8c';
const API_URL = 'https://api.openweathermap.org/data/2.5';

// DOM elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const weatherInfo = document.getElementById('weatherInfo');
const forecast = document.getElementById('forecast');

// Event listeners
searchBtn.addEventListener('click', getWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') getWeather();
});

// Get weather data on page load for default city
window.addEventListener('load', () => {
    getWeather('Delhi');
});

async function getWeather(inputCity = 'Delhi') {
    const city = cityInput.value.trim() || inputCity;
    if (!city) return;
    
    try {
        showLoading();
        
        // Current weather
        const weatherRes = await fetch(`${API_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const weatherData = await weatherRes.json();
        
        if (weatherData.cod !== 200) {
            throw new Error(weatherData.message || 'City not found');
        }
        
        // 5-day forecast
        const forecastRes = await fetch(`${API_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`);
        const forecastData = await forecastRes.json();
        
        displayWeather(weatherData);
        displayForecast(forecastData);
        
    } catch (error) {
        showError(error.message);
    }
}

function displayWeather(data) {
    const { name, main, weather, wind, visibility } = data;
    const { temp, feels_like, humidity } = main;
    const { description, icon } = weather[0];
    const windSpeed = wind.speed * 3.6;
    const visibilityKm = (visibility / 1000).toFixed(1);
    
    document.getElementById('temperature').textContent = `${Math.round(temp)}°C`;
    document.getElementById('description').textContent = description;
    document.getElementById('cityName').textContent = name;
    document.getElementById('dateTime').textContent = new Date().toLocaleString();
    document.getElementById('feelsLike').textContent = Math.round(feels_like);
    document.getElementById('humidity').textContent = humidity;
    document.getElementById('windSpeed').textContent = windSpeed.toFixed(1);
    document.getElementById('visibility').textContent = visibilityKm;
    
    const iconEl = document.getElementById('weatherIcon');
    iconEl.className = 'fas weather-icon';
    setWeatherIcon(iconEl, icon);
    
    weatherInfo.classList.remove('loading', 'error');
}

function displayForecast(data) {
    const dailyData = data.list.filter(item => item.dt_txt.includes('12:00:00'));
    let forecastHTML = '<h3><i class="fas fa-chart-line"></i> 5-Day Forecast</h3><div class="forecast-grid">';
    
    dailyData.slice(0, 5).forEach(day => {
        const date = new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
        const temp = Math.round(day.main.temp);
        const { icon } = day.weather[0];
        
        forecastHTML += `
            <div class="forecast-day">
                <div class="forecast-icon">${getWeatherIcon(icon)}</div>
                <p>${date}</p>
                <p class="forecast-temp">${temp}°C</p>
            </div>
        `;
    });
    
    forecastHTML += '</div>';
    forecast.innerHTML = forecastHTML;
}

function setWeatherIcon(iconEl, iconCode) {
    const icons = {
        '01d': 'fa-sun', '01n': 'fa-moon',
        '02d': 'fa-cloud-sun', '02n': 'fa-cloud-moon',
        '03d': 'fa-cloud', '03n': 'fa-cloud',
        '04d': 'fa-clouds', '04n': 'fa-clouds',
        '09d': 'fa-cloud-rain', '09n': 'fa-cloud-rain',
        '10d': 'fa-cloud-sun-rain', '10n': 'fa-cloud-moon-rain',
        '11d': 'fa-bolt', '11n': 'fa-bolt',
        '13d': 'fa-snowflake', '13n': 'fa-snowflake',
        '50d': 'fa-smog', '50n': 'fa-smog'
    };
    iconEl.className += ` fa-${icons[iconCode] || 'fa-cloud'}`;
}

function getWeatherIcon(iconCode) {
    const icons = {
        '01d': '☀️', '01n': '🌙',
        '02d': '⛅', '02n': '🌙☁️',
        '03d': '☁️', '03n': '☁️',
        '04d': '☁️', '04n': '☁️',
        '09d': '🌧️', '09n': '🌧️',
        '10d': '🌦️', '10n': '🌧️',
        '11d': '⛈️', '11n': '⛈️',
        '13d': '❄️', '13n': '❄️',
        '50d': '🌫️', '50n': '🌫️'
    };
    return icons[iconCode] || '☁️';
}

function showLoading() {
    weatherInfo.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Fetching weather data...</p>
        </div>
    `;
    forecast.innerHTML = '';
}

function showError(message) {
    weatherInfo.innerHTML = `
        <div class="error">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
            <p>Try another city!</p>
        </div>
    `;
    forecast.innerHTML = '';
}