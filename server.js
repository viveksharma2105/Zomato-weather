const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const API_KEY = process.env.API_KEY || "8275f7d48eed237c18cfe08057f12e79";
const PORT = process.env.PORT || 3000;

// Log startup info
console.log(`Starting server with API_KEY: ${API_KEY ? API_KEY.substring(0, 8) + '...' : 'NOT SET'}`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

const contentTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json"
};

http
  .createServer((req, res) => {
    // Set CORS headers for all responses
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      return res.end();
    }

    const [urlPath, query] = req.url.split("?");
    const params = new URLSearchParams(query);

    // Log incoming requests for debugging
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

    // Health check endpoint
    if (urlPath === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }));
    }

    // Serve static files
    if (urlPath === "/" || urlPath === "/index.html") {
      const filePath = path.join(__dirname, "index.html");
      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(500);
          return res.end("Error loading page");
        }
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(content);
      });
      return;
    }

    // Serve CSS, JS, and other static files
    const ext = path.extname(urlPath);
    if (contentTypes[ext]) {
      const filePath = path.join(__dirname, urlPath);
      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(404);
          return res.end("File not found");
        }
        res.writeHead(200, { "Content-Type": contentTypes[ext] });
        res.end(content);
      });
      return;
    }

    // API routes
    let apiUrl;
    if (urlPath === "/weather/coordinates") {
      apiUrl = `https://www.weatherunion.com/gw/weather/external/v0/get_weather_data?latitude=${params.get(
        "latitude"
      )}&longitude=${params.get("longitude")}`;
    } else if (urlPath === "/weather/locality") {
      apiUrl = `https://www.weatherunion.com/gw/weather/external/v0/get_locality_weather_data?locality_id=${params.get(
        "locality_id"
      )}`;
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Route not found" }));
    }

    https
      .get(apiUrl, { headers: { "X-Zomato-Api-Key": API_KEY } }, (apiRes) => {
        let data = "";
        apiRes.on("data", (chunk) => (data += chunk));
        apiRes.on("end", () => {
          // Log for debugging
          console.log(`API Response Status: ${apiRes.statusCode}`);
          console.log(`API Response: ${data.substring(0, 200)}`);
          
          // Forward the actual status code from the Weather Union API
          res.writeHead(apiRes.statusCode, { "Content-Type": "application/json" });
          res.end(data);
        });
      })
      .on("error", (err) => {
        console.error("API request error:", err.message);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "API request failed", message: err.message }));
      });
  })
  .listen(PORT, '0.0.0.0', () =>
    console.log(`🌤️  Server running on port ${PORT}`)
  );
