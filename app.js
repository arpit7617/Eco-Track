require("dotenv").config(); // Load environment variables

const express = require("express");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 3001; // Dynamic port for flexibility

// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Import and use community routes
const communityRoutes = require("./routes/community");
app.use("/community", communityRoutes);

// Serve static files
app.use(express.static("public"));

// Home Route
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// Weather Route (with API Integration)
app.get("/weather", async (req, res) => {
  const city = req.query.city || "Delhi";
  const apiKey = process.env.OPENWEATHER_API_KEY;

  try {
    console.log("🔍 Fetching weather for:", city);

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    const response = await axios.get(weatherUrl);
    const weatherData = response.data;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>EcoTrack - Weather</title>
        <meta charset="UTF-8">
        <link rel="stylesheet" href="/style.css">
      </head>
      <body>
        <nav>
          <a href="/">Home</a>
          <a href="/weather">Weather</a>
          <a href="/aqi">AQI Monitor</a>
          <a href="/community">Community</a>
        </nav>

        <h1>Real-Time Weather 🌦️</h1>

        <form action="/weather" method="GET">
          <label for="city">Enter City:</label>
          <input type="text" id="city" name="city" required>
          <button type="submit">Get Weather</button>
        </form>

        <div id="weather-info">
          <h2>Weather in ${weatherData.name}</h2>
          <p>Temperature: ${weatherData.main.temp}°C</p>
          <p>Condition: ${weatherData.weather[0].description}</p>
          <p>Humidity: ${weatherData.main.humidity}%</p>
          <p>Wind Speed: ${weatherData.wind.speed} m/s</p>
          <p>Visibility: ${weatherData.visibility / 1000} km</p>
        </div>

      </body>
      </html>
    `;

    res.send(htmlContent);
  } catch (error) {
    console.error("❌ Error fetching weather:", error.message);
    res.send("<h1>Weather data not available. Try again!</h1>");
  }
});

// AQI Route (Using Nearest City for Better Search)
app.get("/aqi", async (req, res) => {
  const city = req.query.city || "Delhi";
  const apiKey = process.env.IQAIR_API_KEY;

  try {
    console.log("🌫️ Fetching AQI for:", city);

    // Get City Coordinates from OpenWeather API
    const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${process.env.OPENWEATHER_API_KEY}`;
    const geoResponse = await axios.get(geoUrl);

    if (!geoResponse.data.length) {
      throw new Error("City not found.");
    }

    const { lat, lon } = geoResponse.data[0];
    console.log(`📍 Coordinates for ${city}: lat=${lat}, lon=${lon}`);

    // Fetch AQI Data from IQAir API using Coordinates
    const aqiUrl = `http://api.airvisual.com/v2/nearest_city?lat=${lat}&lon=${lon}&key=${apiKey}`;
    const aqiResponse = await axios.get(aqiUrl);

    if (aqiResponse.data.status !== "success") {
      throw new Error("Failed to fetch AQI data.");
    }

    const pollution = aqiResponse.data.data.current.pollution;
    const weather = aqiResponse.data.data.current.weather;
    const cityName = aqiResponse.data.data.city;
    const countryName = aqiResponse.data.data.country;

    // Render AQI Data to the User
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>EcoTrack - AQI</title>
        <meta charset="UTF-8">
        <link rel="stylesheet" href="/style.css">
      </head>
      <body>
        <nav>
          <a href="/">Home</a>
          <a href="/weather">Weather</a>
          <a href="/aqi">AQI Monitor</a>
          <a href="/community">Community</a>
        </nav>

        <h1>Real-Time AQI 🌫️</h1>

        <form action="/aqi" method="GET">
          <label for="city">Enter City:</label>
          <input type="text" id="city" name="city" required>
          <button type="submit">Get AQI</button>
        </form>

        <div id="aqi-info">
          <h2>AQI in ${cityName}, ${countryName}</h2>
          <p><strong>AQI Level (US):</strong> ${pollution.aqius}</p>
          <p><strong>Main Pollutant:</strong> ${pollution.mainus}</p>
          <p><strong>Temperature:</strong> ${weather.tp}°C</p>
          <p><strong>Humidity:</strong> ${weather.hu}%</p>
          <p><strong>Wind Speed:</strong> ${weather.ws} m/s</p>
        </div>

      </body>
      </html>
    `;

    res.send(htmlContent);
  } catch (error) {
    console.error("❌ Error fetching AQI:", error.message);
    res.send("<h1>❌ AQI data not available. Try another city!</h1>");
  }
});

// Community Route (Placeholder)
app.get("/community", (req, res) => {
  res.send("<h1>Join the EcoTrack Community 🤝</h1>");
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).send("Something went wrong! We're working on it.");
});

// Start server (ONLY ONCE)
app.listen(port, () => {
  console.log(`🚀 EcoTrack is running on http://localhost:${port}`);
});
