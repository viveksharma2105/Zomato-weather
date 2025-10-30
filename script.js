// Clock functionality
document.getElementById('clock');

setInterval(function() {
  let date = new Date();
  clock.innerHTML = date.toLocaleTimeString();
}, 1000);

// API Key (now handled by backend server)
const API_BASE_URL = 'http://localhost:3000';

// Toggle between input methods
const radioButtons = document.querySelectorAll('input[name="fetchMethod"]');
const coordinatesInput = document.getElementById('coordinatesInput');
const localityInput = document.getElementById('localityInput');

radioButtons.forEach(radio => {
  radio.addEventListener('change', function() {
    if (this.value === 'coordinates') {
      coordinatesInput.style.display = 'flex';
      localityInput.style.display = 'none';
    } else {
      coordinatesInput.style.display = 'none';
      localityInput.style.display = 'flex';
    }
    // Clear weather info when switching
    document.getElementById('weatherInfo').style.display = 'none';
  });
});

// Event listeners for submit buttons
document.getElementById("submitCoordinates").addEventListener("click", getWeatherByCoordinates);
document.getElementById("submitLocality").addEventListener("click", getWeatherByLocality);

// Loading spinner functions
function showLoading() {
  document.getElementById('loadingSpinner').style.display = 'block';
  document.getElementById('weatherInfo').style.display = 'none';
}

function hideLoading() {
  document.getElementById('loadingSpinner').style.display = 'none';
}

// Fetch weather by coordinates
async function getWeatherByCoordinates() {
  const latitude = document.getElementById("latitude").value;
  const longitude = document.getElementById("longitude").value;

  if (!latitude || !longitude) {
    alert("Please enter both latitude and longitude.");
    return;
  }

  // Show loading spinner
  showLoading();

  try {
    const response = await fetch(
      `${API_BASE_URL}/weather/coordinates?latitude=${latitude}&longitude=${longitude}`
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    hideLoading();
    displayWeatherInfo(data, 'coordinates');
  } catch (error) {
    hideLoading();
    alert("Error fetching weather data. Please check your coordinates and try again.");
    console.error(error);
  }
}

// Fetch weather by locality code
async function getWeatherByLocality() {
  const localityCode = document.getElementById("localityCode").value.trim();

  if (!localityCode) {
    alert("Please enter a locality code.");
    return;
  }

  // Show loading spinner
  showLoading();

  try {
    const response = await fetch(
      `${API_BASE_URL}/weather/locality?locality_id=${localityCode}`
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    hideLoading();
    displayWeatherInfo(data, 'locality');
  } catch (error) {
    hideLoading();
    alert("Error fetching weather data. Please check your locality code and try again.");
    console.error(error);
  }
}

// Display weather information
function displayWeatherInfo(data, method) {
  const weatherInfo = document.getElementById("weatherInfo");
  weatherInfo.style.display = "block";

  const deviceType = data.device_type === 1 ? "AWS" : "Rain gauge system";
  const weather = data.locality_weather_data;

  let methodLabel = method === 'coordinates' ? 'Coordinates' : 'Locality Code';

  weatherInfo.innerHTML = `
    <h2>🌤️ Weather Information</h2>
    <p><span class="result">📍</span><strong>Fetch Method:</strong> ${methodLabel}</p>
    <p><span class="result">📊</span><strong>Status:</strong> ${data.status} ${data.message ? '- ' + data.message : ''}</p>
    <p><span class="result">🔧</span><strong>Device Type:</strong> ${deviceType}</p>
    <p><span class="result">🌡️</span><strong>Temperature:</strong> ${weather.temperature !== null ? weather.temperature + "°C" : "N/A"}</p>
    <p><span class="result">💧</span><strong>Humidity:</strong> ${weather.humidity !== null ? weather.humidity + "%" : "N/A"}</p>
    <p><span class="result">💨</span><strong>Wind Speed:</strong> ${weather.wind_speed !== null ? weather.wind_speed + " m/s" : "N/A"}</p>
    <p><span class="result">🧭</span><strong>Wind Direction:</strong> ${weather.wind_direction !== null ? weather.wind_direction + "°" : "N/A"}</p>
    <p><span class="result">🌧️</span><strong>Rain Intensity:</strong> ${weather.rain_intensity !== null ? weather.rain_intensity + " mm/min" : "N/A"}</p>
    <p><span class="result">☔</span><strong>Rain Accumulation:</strong> ${weather.rain_accumulation !== null ? weather.rain_accumulation + " mm" : "N/A"}</p>
    ${weather.aqi_pm_2_point_5 !== undefined ? `<p><span class="result">💨</span><strong>AQI PM 2.5:</strong> ${weather.aqi_pm_2_point_5}</p>` : ''}
    ${weather.aqi_pm_10 !== undefined ? `<p><span class="result">💨</span><strong>AQI PM 10:</strong> ${weather.aqi_pm_10}</p>` : ''}
  `;
}