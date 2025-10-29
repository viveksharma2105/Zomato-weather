// City Search Functionality
let locationsData = [];

// Load cities data
async function loadCitiesData() {
  try {
    const response = await fetch('cities.json');
    const data = await response.json();
    locationsData = data.locations;
    console.log(`✅ Loaded ${locationsData.length} locations`);
  } catch (error) {
    console.error('Error loading cities data:', error);
  }
}

// Search locations
function searchLocations(query) {
  if (!query || query.length < 2) return [];
  
  const searchTerm = query.toLowerCase();
  return locationsData.filter(loc => 
    loc.city.toLowerCase().includes(searchTerm) ||
    loc.locality.toLowerCase().includes(searchTerm) ||
    loc.localityId.toLowerCase().includes(searchTerm)
  ).slice(0, 10); // Limit to 10 results
}

// Get all cities (unique)
function getAllCities() {
  const cities = {};
  locationsData.forEach(loc => {
    if (!cities[loc.city]) {
      cities[loc.city] = [];
    }
    cities[loc.city].push(loc);
  });
  return cities;
}

// Select location and auto-fill
function selectLocation(location) {
  const currentMethod = document.querySelector('input[name="fetchMethod"]:checked').value;
  
  if (currentMethod === 'coordinates') {
    document.getElementById('latitude').value = location.latitude;
    document.getElementById('longitude').value = location.longitude;
  } else {
    document.getElementById('localityCode').value = location.localityId;
  }
  
  // Close search modal
  closeSearchModal();
  
  // Show notification
  showNotification(`📍 Selected: ${location.locality}, ${location.city}`);
}

// Show notification
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Open search modal
function openSearchModal() {
  const modal = document.getElementById('searchModal');
  modal.style.display = 'flex';
  document.getElementById('locationSearch').focus();
  renderAllCities();
}

// Close search modal
function closeSearchModal() {
  document.getElementById('searchModal').style.display = 'none';
  document.getElementById('locationSearch').value = '';
  document.getElementById('searchResults').innerHTML = '';
}

// Render search results
function renderSearchResults(results) {
  const container = document.getElementById('searchResults');
  
  if (results.length === 0) {
    container.innerHTML = '<div class="no-results">No locations found</div>';
    return;
  }
  
  container.innerHTML = results.map(loc => `
    <div class="search-result-item" onclick='selectLocation(${JSON.stringify(loc)})'>
      <div class="result-city">🏙️ ${loc.city}</div>
      <div class="result-locality">📍 ${loc.locality}</div>
      <div class="result-code">${loc.localityId}</div>
    </div>
  `).join('');
}

// Render all cities
function renderAllCities() {
  const cities = getAllCities();
  const container = document.getElementById('searchResults');
  
  const html = Object.keys(cities).sort().map(cityName => `
    <div class="city-group">
      <div class="city-header" onclick="toggleCity('${cityName}')"">
        <span>🏙️ ${cityName} (${cities[cityName].length})</span>
        <span class="toggle-icon">▼</span>
      </div>
      <div class="city-localities" id="city-${cityName.replace(/\s+/g, '-')}" style="display: none;">
        ${cities[cityName].map(loc => `
          <div class="locality-item" onclick='selectLocation(${JSON.stringify(loc)})'>
            📍 ${loc.locality} <span class="locality-code">${loc.localityId}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
  
  container.innerHTML = html;
}

// Toggle city dropdown
function toggleCity(cityName) {
  const element = document.getElementById(`city-${cityName.replace(/\s+/g, '-')}`);
  const isVisible = element.style.display === 'block';
  element.style.display = isVisible ? 'none' : 'block';
}

// Search input handler
document.addEventListener('DOMContentLoaded', () => {
  loadCitiesData();
  
  const searchInput = document.getElementById('locationSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value;
      if (query.length >= 2) {
        const results = searchLocations(query);
        renderSearchResults(results);
      } else {
        renderAllCities();
      }
    });
  }
});
