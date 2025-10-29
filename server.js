const http = require("http");
const https = require("https");

const API_KEY = "8275f7d48eed237c18cfe08057f12e79";
const PORT = 3000;

http
  .createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");

    if (req.method === "OPTIONS") return res.end();

    const [path, query] = req.url.split("?");
    const params = new URLSearchParams(query);

    let apiUrl;
    if (path === "/weather/coordinates") {
      apiUrl = `https://www.weatherunion.com/gw/weather/external/v0/get_weather_data?latitude=${params.get(
        "latitude"
      )}&longitude=${params.get("longitude")}`;
    } else if (path === "/weather/locality") {
      apiUrl = `https://www.weatherunion.com/gw/weather/external/v0/get_locality_weather_data?locality_id=${params.get(
        "locality_id"
      )}`;
    } else {
      return res.end(JSON.stringify({ error: "Route not found" }));
    }

    https
      .get(apiUrl, { headers: { "X-Zomato-Api-Key": API_KEY } }, (apiRes) => {
        let data = "";
        apiRes.on("data", (chunk) => (data += chunk));
        apiRes.on("end", () => res.end(data));
      })
      .on("error", () =>
        res.end(JSON.stringify({ error: "API request failed" }))
      );
  })
  .listen(PORT, () =>
    console.log(`🌤️  Server running at http://localhost:${PORT}`)
  );
