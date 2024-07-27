document.getElementById('clock')  

setInterval(function(){
  let date = new Date();

clock.innerHTML = date.toLocaleTimeString();
} ,1000)


const apiKey = config.API_KEY;

document.getElementById("submit").addEventListener("click", getWeatherData);

async function getWeatherData() {
  const latitude = document.getElementById("latitude").value;
  const longitude = document.getElementById("longitude").value;

  if (!latitude || !longitude) {
    alert("Please enter both latitude and longitude.");
    return;
  }

  try {
    const response = await fetch(
      `https://www.weatherunion.com/gw/weather/external/v0/get_weather_data?latitude=${latitude}&longitude=${longitude}`,
      {
        headers: {
          "content-type": "application/json",
          "x-zomato-api-key": apiKey,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    displayWeatherInfo(data);
  } catch (error) {
    alert("Error:", error)
  }
}

function displayWeatherInfo(data) {
  const weatherInfo = document.getElementById("weatherInfo");
  weatherInfo.style.display = "block";

  const deviceType = data.device_type === 1 ? "AWS" : "Rain gauge system";
  const weather = data.locality_weather_data;

  weatherInfo.innerHTML = `
        <h2>Weather Information</h2>

        <p><span class="result">📊</span><strong>Status:</strong> ${data.status} - ${data.message}</p>
       
        <p><span class="result">🌡️</span><strong>Temperature:</strong> ${weather.temperature !== null ? weather.temperature + "°C" : "N/A"}</p>

        <p><span class="result">💧</span><strong>Humidity:</strong> ${weather.humidity !== null ? weather.humidity + "%" : "N/A"}</p>

        <p><span class="result">💨</span><strong>Wind Speed:</strong> ${weather.wind_speed !== null ? weather.wind_speed + " m/s" : "N/A"}</p>

        <p><span class="result">🧭</span><strong>Wind Direction:</strong> ${weather.wind_direction !== null ? weather.wind_direction + "°" : "N/A"}</p>

        <p><span class="result">🌧️</span><strong>Rain Intensity:</strong> ${weather.rain_intensity !== null ? weather.rain_intensity + " mm/min" : "N/A"}</p>

        <p><span class="result">☔</span><strong>Rain Accumulation:</strong> ${weather.rain_accumulation !== null ? weather.rain_accumulation + " mm" : "N/A"}</p>
    `;
}