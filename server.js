const http = require('http');
const https = require('https');
const url = require('url');

const API_KEY = '8275f7d48eed237c18cfe08057f12e79';
const PORT = 3000;

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  
  // Route for coordinates-based weather
  if (parsedUrl.pathname === '/weather/coordinates') {
    const { latitude, longitude } = parsedUrl.query;
    
    if (!latitude || !longitude) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing latitude or longitude' }));
      return;
    }

    const apiUrl = `https://www.weatherunion.com/gw/weather/external/v0/get_weather_data?latitude=${latitude}&longitude=${longitude}`;
    
    makeApiRequest(apiUrl, res);
  }
  // Route for locality-based weather
  else if (parsedUrl.pathname === '/weather/locality') {
    const { locality_id } = parsedUrl.query;
    
    if (!locality_id) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing locality_id' }));
      return;
    }

    const apiUrl = `https://www.weatherunion.com/gw/weather/external/v0/get_locality_weather_data?locality_id=${locality_id}`;
    
    makeApiRequest(apiUrl, res);
  }
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Route not found' }));
  }
});

function makeApiRequest(apiUrl, res) {
  const options = {
    headers: {
      'X-Zomato-Api-Key': API_KEY
    }
  };

  https.get(apiUrl, options, (apiRes) => {
    let data = '';

    apiRes.on('data', (chunk) => {
      data += chunk;
    });

    apiRes.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(data);
    });
  }).on('error', (error) => {
    console.error('API request error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to fetch weather data' }));
  });
}

server.listen(PORT, () => {
  console.log(`🌤️  Weather proxy server running at http://localhost:${PORT}/`);
  console.log(`📍 Coordinates endpoint: http://localhost:${PORT}/weather/coordinates?latitude=12.933756&longitude=77.625825`);
  console.log(`🏘️  Locality endpoint: http://localhost:${PORT}/weather/locality?locality_id=ZWL001156`);
});
