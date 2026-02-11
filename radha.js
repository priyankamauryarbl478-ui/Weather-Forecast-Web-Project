const apiKey = "86b7a7f03ae26353d4d07af83fefc7c2";
let isCelsius = true;
let animationInterval;

async function getWeather(city) {
  const weatherBox = document.getElementById("weatherBox");
  if (!city) {
    city = document.getElementById("cityInput").value.trim();
  }

  if (!city) {
    weatherBox.innerHTML = "<p>Please enter a city name.</p>";
    return;
  }

  weatherBox.innerHTML = "<p>Fetching live weather data...</p>";

  try {
    const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    const res = await fetch(weatherURL);
    const data = await res.json();

    if (data.cod !== 200) {
      weatherBox.innerHTML = "<p>City not found. Try again.</p>";
      return;
    }

    const { main, weather, wind, sys, name, coord } = data;
    const icon = weather[0].icon;
    const desc = weather[0].description;
    const sunrise = new Date(sys.sunrise * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const sunset = new Date(sys.sunset * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Forecast API
    const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${coord.lat}&lon=${coord.lon}&units=metric&appid=${apiKey}`;
    const forecastRes = await fetch(forecastURL);
    const forecastData = await forecastRes.json();
    const dailyForecast = forecastData.list.filter(f => f.dt_txt.includes("12:00:00"));

    weatherBox.innerHTML = `
      <div class="weather-cards">
        <div class="weather-card">
          <img src="https://openweathermap.org/img/wn/${icon}@4x.png" alt="${desc}">
          <h2>${name}, ${sys.country}</h2>
          <p>${desc}</p>
        </div>

        <div class="weather-card">
          <h2>🌡️ Temperature</h2>
          <p id="tempValue" style="font-size: 22px; font-weight: 600;">${main.temp.toFixed(1)}°C</p>
        </div>

        <div class="weather-card">
          <h2>💧 Humidity</h2>
          <p>${main.humidity}%</p>
        </div>

        <div class="weather-card">
          <h2>🌬️ Wind Speed</h2>
          <p>${wind.speed} m/s</p>
        </div>

        <div class="weather-card">
          <h2>☀️ Sunrise</h2>
          <p>${sunrise}</p>
        </div>

        <div class="weather-card">
          <h2>🌇 Sunset</h2>
          <p>${sunset}</p>
        </div>
      </div>

      <div class="forecast">
        <h3>5-Day Forecast</h3>
        <div class="forecast-row">
          ${dailyForecast.map(f => `
            <div class="forecast-item">
              <span>${new Date(f.dt * 1000).toLocaleDateString([], { weekday: 'short' })}</span>
              <img src="https://openweathermap.org/img/wn/${f.weather[0].icon}@2x.png" alt="${f.weather[0].main}">
              <span>${f.main.temp.toFixed(1)}°C</span>
              <span>${f.weather[0].main}</span>
            </div>
          `).join("")}
        </div>
      </div>
    `;

    const condition = weather[0].main.toLowerCase();
    setBackground(condition);
    startWeatherAnimation(condition);
  } catch {
    weatherBox.innerHTML = "<p>Failed to fetch weather data.</p>";
  }
}


function getLocationWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      getWeather(data.name);
    }, () => {
      alert("Location access denied. Please allow location permission.");
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

// Temperature toggle
function toggleUnit() {
  const tempElement = document.getElementById("tempValue");
  const toggleBtn = document.getElementById("unitToggle");
  if (!tempElement) return;

  let currentTemp = parseFloat(tempElement.textContent);
  if (isCelsius) {
    let fahrenheit = (currentTemp * 9) / 5 + 32;
    tempElement.textContent = `${fahrenheit.toFixed(1)}°F`;
    toggleBtn.textContent = "Switch to °C";
  } else {
    let celsius = ((currentTemp - 32) * 5) / 9;
    tempElement.textContent = `${celsius.toFixed(1)}°C`;
    toggleBtn.textContent = "Switch to °F";
  }
  isCelsius = !isCelsius;
}

// Backgrounds
function setBackground(weather) {
  const body = document.body;
  const backgrounds = {
    clear: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1950&q=80')",
    clouds: "url('https://images.unsplash.com/photo-1499346030926-9a72daac6c63?auto=format&fit=crop&w=1950&q=80')",
    rain: "url('https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1950&q=80')",
    snow: "url('https://images.unsplash.com/photo-1608889175123-8f1c882c07ef?auto=format&fit=crop&w=1950&q=80')",
    thunderstorm: "url('https://images.unsplash.com/photo-1500674425229-f692875b0ab7?auto=format&fit=crop&w=1950&q=80')",
    default: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1950&q=80')"
  };
  body.style.backgroundImage = backgrounds[weather] || backgrounds.default;
}

function startWeatherAnimation(type) {
  const canvas = document.getElementById("weatherCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  cancelAnimationFrame(animationInterval);

  let particles = [];
  if (type.includes("rain")) {
    for (let i = 0; i < 100; i++) {
      particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, length: Math.random() * 15 + 10, speed: Math.random() * 3 + 2 });
    }
  } else if (type.includes("snow")) {
    for (let i = 0; i < 80; i++) {
      particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, radius: Math.random() * 3 + 1, speed: Math.random() * 1 + 0.5 });
    }
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (type.includes("rain")) {
      ctx.strokeStyle = "rgba(173,216,230,0.8)";
      for (let drop of particles) {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.length);
        ctx.stroke();
        drop.y += drop.speed;
        if (drop.y > canvas.height) drop.y = 0;
      }
    } else if (type.includes("snow")) {
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      for (let flake of particles) {
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fill();
        flake.y += flake.speed;
        if (flake.y > canvas.height) flake.y = 0;
      }
    }
    animationInterval = requestAnimationFrame(animate);
  }
  animate();
}