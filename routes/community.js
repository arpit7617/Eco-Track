// routes/community.js
const express = require("express");
const router = express.Router();

// Temporary storage for tips (in-memory)
const tips = [];

// Serve the Community Page
router.get("/", (req, res) => {
  let tipsHTML = tips.map((tip) => `
    <p><strong>${tip.username}:</strong> ${tip.tip}</p>
  `).join("");

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>EcoTrack - Community</title>
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

      <h1>🌍 EcoTrack Community</h1>
      <p>Share your eco-friendly tips and learn from others!</p>

      <form action="/community" method="POST">
        <label for="username">Your Name:</label>
        <input type="text" id="username" name="username" required>
        
        <label for="tip">Your Eco-Friendly Tip:</label>
        <textarea id="tip" name="tip" rows="4" required></textarea>
        
        <button type="submit">Share Tip</button>
      </form>

      <h2>📚 Community Tips</h2>
      <div id="tips-container">${tipsHTML || "<p>No tips shared yet. Be the first!</p>"}</div>
    </body>
    </html>
  `);
});

// Handle Tip Submission (POST request)
router.post("/", (req, res) => {
  const { username, tip } = req.body;
  if (username && tip) {
    tips.push({ username, tip });
  }
  res.redirect("/community");
});

module.exports = router;
