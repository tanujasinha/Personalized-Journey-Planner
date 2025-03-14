const weatherContainer = document.querySelector('.weather-placeholder');
const tripData = JSON.parse(sessionStorage.getItem('tripData'));
console.log("Trip Data:", tripData);

document.addEventListener('DOMContentLoaded', async function () {
    if (!tripData) {
        window.location.href = 'trip-planner.html';
        return;
    }

    // Initialize the map
    initMap(tripData.latitude, tripData.longitude);

    // Fetch and display places
    await fetchAndDisplayPlaces(tripData);

    // Fetch weather data
    await fetchWeather(tripData.latitude, tripData.longitude, tripData.destination);
});

async function fetchWeather(lat, lon, destination) {
    const apiKey = "c8d47b3c69227c3bba7dd17a791dc037"; // OpenWeather API Key

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
        console.log("fetchWeather function got a response");
        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }

        const data = await response.json();
        const forecastData = processWeatherData(data);

        displayWeather(destination, forecastData);
    } catch (error) {
        console.error('Weather Fetch Error:', error);
        weatherContainer.innerHTML = '<p>Weather data not available</p>';
    }
}

function processWeatherData(data) {
    const dailyForecast = {};

    data.list.forEach(entry => {
        const date = entry.dt_txt.split(" ")[0];
        if (!dailyForecast[date]) {
            dailyForecast[date] = {
                temperature: entry.main.temp,
                description: entry.weather[0].description,
                humidity: entry.main.humidity,
                windSpeed: entry.wind.speed
            };
        }
    });

    return Object.entries(dailyForecast).map(([date, details]) => ({
        date,
        ...details
    })).slice(0, tripData.days); // Get n day forecast
}

function displayWeather(destination, forecast) {
    let weatherHTML = `
    <div class="container">
        <h5 class="mb-3" style="text-align:center">${destination}</h5>
        <div class="row" style="justify-content: center;">
    `;

    forecast.forEach(day => {
        weatherHTML += `
        <div class="col-md-3 col-6 text-center mb-3">
            <div class="card h-100">
                <div class="card-body">
                    <h6>${day.date}</h6>
                    <div class="display-6">${day.temperature}°C</div>
                    <p>${day.description}</p>
                    <div>
                        <small>Humidity: ${day.humidity}%</small><br>
                        <small>Wind: ${day.windSpeed} km/h</small>
                    </div>
                </div>
            </div>
        </div>
    `;
    });

    weatherHTML += `
        </div>
    </div>
    `;

    weatherContainer.innerHTML = weatherHTML;
}

function initMap(lat, lng) {
    const mapPlaceholder = document.querySelector('.map-placeholder');
    
    // Create an iframe with OpenStreetMap
    const mapHtml = `
        <iframe 
            width="100%" 
            height="400" 
            frameborder="0" 
            scrolling="no" 
            marginheight="0" 
            marginwidth="0" 
            src="https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.05},${lat - 0.05},${lng + 0.05},${lat + 0.05}&layer=mapnik&marker=${lat},${lng}" 
            style="border: 1px solid #ddd; border-radius: 4px;">
        </iframe>
    `;
    
    mapPlaceholder.innerHTML = mapHtml;
}

async function fetchAndDisplayPlaces(tripData) {
    const placesContainer = document.getElementById('places-container');
    
    // Convert interests to Foursquare categories
    const categories = getCategories(tripData.interests);
    
    if (categories.length === 0) {
        placesContainer.innerHTML = '<p class="text-center">Please select at least one interest to see recommendations.</p>';
        return;
    }
    
    try {
        // Foursquare API credentials - replace with your actual API key
        const API_KEY = 'fsq3aftYkFNUKg2cs3cMUytKuJrntyjm5Sq+qjd8iw4s7Uk=';
        
        // Create request options
        const options = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': API_KEY
            }
        };
        
        // Build the URL with categories as comma-separated list
        const categoryParam = categories.join(',');
        const radius = 10000; // 10km radius
        const limit = 50; // Get more places to ensure enough for all days
        
        const url = `https://api.foursquare.com/v3/places/search?ll=${tripData.latitude},${tripData.longitude}&radius=${radius}&categories=${categoryParam}&limit=${limit}`;
        console.log("Fetching places from URL:", url);
        
        // Fetch places from Foursquare
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch places: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Foursquare Places Data:", data);
        
        // Generate and display itinerary
        generateItinerary(data.results, tripData);
        
    } catch (error) {
        console.error('Error fetching places:', error);
        placesContainer.innerHTML = `
            <div class="alert alert-danger">
                <p>Failed to load places. Please try again later.</p>
                <p>Error: ${error.message}</p>
            </div>
        `;
    }
}

function getCategories(interests) {
    // Map user interests to Foursquare category IDs
    // Reference: https://developer.foursquare.com/reference/categories
    const categoryMap = {
        adventure: ['16000', '19013', '10056'], // Sports, Recreation, Outdoor
        history: ['10025', '16007', '10027'], // Arts & Entertainment, Landmarks, Museums
        food: ['13000', '13065', '13338'], // Food, Restaurants, Cafes
        nature: ['16032', '16033', '16034'] // Parks, Gardens, Mountains
    };
    
    // Get selected categories
    const selectedCategories = [];
    for (const [interest, isSelected] of Object.entries(interests)) {
        if (isSelected && categoryMap[interest]) {
            selectedCategories.push(...categoryMap[interest]);
        }
    }
    
    return [...new Set(selectedCategories)]; // Remove duplicates
}

function generateItinerary(places, tripData) {
    const placesContainer = document.getElementById('places-container');
    const days = parseInt(tripData.days);
    
    // If no places found
    if (!places || places.length === 0) {
        placesContainer.innerHTML = '<p class="text-center">No places found for your interests in this location.</p>';
        return;
    }
    
    // Shuffle places to get variety
    const shuffled = [...places].sort(() => 0.5 - Math.random());
    
    // Determine places per day (3-4 places per day)
    const placesPerDay = Math.min(4, Math.ceil(shuffled.length / days));
    
    let itineraryHTML = '';
    
    // Create tabs for each day
    itineraryHTML += `
        <ul class="nav nav-tabs mb-3" id="itinerary-tabs" role="tablist">
    `;
    
    for (let day = 1; day <= days; day++) {
        itineraryHTML += `
            <li class="nav-item" role="presentation">
                <button class="nav-link ${day === 1 ? 'active' : ''}" 
                    id="day${day}-tab" 
                    data-bs-toggle="tab" 
                    data-bs-target="#day${day}" 
                    type="button" 
                    role="tab" 
                    aria-controls="day${day}" 
                    aria-selected="${day === 1}">
                    Day ${day}
                </button>
            </li>
        `;
    }
    
    itineraryHTML += `</ul>`;
    
    // Create tab content
    itineraryHTML += `
        <div class="tab-content" id="itinerary-content">
    `;
    
    for (let day = 1; day <= days; day++) {
        // Get places for this day
        const startIdx = (day - 1) * placesPerDay;
        const dayPlaces = shuffled.slice(startIdx, startIdx + placesPerDay);
        
        itineraryHTML += `
            <div class="tab-pane fade ${day === 1 ? 'show active' : ''}" 
                id="day${day}" 
                role="tabpanel" 
                aria-labelledby="day${day}-tab">
                
                <h5 class="mb-3">Day ${day} Itinerary</h5>
                
                <div class="row">
        `;
        
        // If we have places for this day
        if (dayPlaces.length > 0) {
            dayPlaces.forEach((place, index) => {
                const timeSlots = [
                    "Morning (9:00 AM - 11:00 AM)",
                    "Lunch (12:00 PM - 2:00 PM)",
                    "Afternoon (2:30 PM - 5:00 PM)",
                    "Evening (6:00 PM - 8:00 PM)"
                ];
                
                const timeSlot = timeSlots[index % timeSlots.length];
                
                // Get place details
                const name = place.name || 'Unknown Place';
                const category = place.categories && place.categories.length > 0 
                    ? place.categories[0].name 
                    : 'Attraction';
                
                // Get address
                const location = place.location || {};
                const address = location.formatted_address || 
                    (location.address ? `${location.address}, ${location.locality || ''}` : 'Address not available');
                
                // Get image or use placeholder
                let imageUrl = 'https://via.placeholder.com/300x200?text=No+Image';
                
                // Try to get photo from Foursquare API response
                if (place.photos && place.photos.length > 0) {
                    imageUrl = `${place.photos[0].prefix}300x200${place.photos[0].suffix}`;
                } else if (place.categories && place.categories[0] && place.categories[0].icon) {
                    const icon = place.categories[0].icon;
                    imageUrl = `${icon.prefix}bg_64${icon.suffix}`;
                }
                
                itineraryHTML += `
                    <div class="col-md-6 mb-3">
                        <div class="card h-100">
                            <div class="card-header bg-primary text-white">
                                ${timeSlot}
                            </div>
                            <img src="${imageUrl}" class="card-img-top" alt="${name}" 
                                onerror="this.onerror=null; this.src='https://via.placeholder.com/300x200?text=No+Image';">
                            <div class="card-body">
                                <h5 class="card-title">${name}</h5>
                                <h6 class="card-subtitle mb-2 text-muted">${category}</h6>
                                <p class="card-text">${address}</p>
                                ${place.tel ? `<p><small>Phone: ${place.tel}</small></p>` : ''}
                                ${place.website ? `<a href="${place.website}" target="_blank" class="btn btn-sm btn-outline-primary">Visit Website</a>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            });
        } else {
            itineraryHTML += `
                <div class="col-12">
                    <div class="alert alert-info">
                        No places found for Day ${day}. Consider adjusting your interests or destination.
                    </div>
                </div>
            `;
        }
        
        itineraryHTML += `
                </div>
            </div>
        `;
    }
    
    itineraryHTML += `</div>`;
    
    // Add budget information
    itineraryHTML += `
        <div class="card mt-4">
            <div class="card-header bg-warning">
                <h5 class="mb-0">Budget Estimation</h5>
            </div>
            <div class="card-body">
                <p>Total budget: ₹${tripData.budget}</p>
                <p>Estimated daily expense: ₹${Math.round(tripData.budget / tripData.days)}</p>
                <p><small>This is a rough estimate. Actual expenses may vary based on your choices.</small></p>
            </div>
        </div>
    `;
    
    placesContainer.innerHTML = itineraryHTML;
    
    // Add Bootstrap JS for tab functionality
    addBootstrapScript();
}

// Add Bootstrap JS for tab functionality
function addBootstrapScript() {
    // Check if Bootstrap JS is already loaded
    if (!document.querySelector('script[src*="bootstrap.bundle.min.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js';
        script.integrity = 'sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz';
        script.crossOrigin = 'anonymous';
        script.onload = function() {
            console.log("Bootstrap JS loaded successfully");
            // Initialize tabs after Bootstrap is loaded
            initializeTabs();
        };
        document.body.appendChild(script);
    } else {
        // Bootstrap already loaded, just initialize tabs
        initializeTabs();
    }
}

// Initialize Bootstrap tabs
function initializeTabs() {
    const tabs = document.querySelectorAll('[data-bs-toggle="tab"]');
    tabs.forEach(tab => {
        tab.addEventListener('click', function(event) {
            event.preventDefault();
            const target = document.querySelector(this.dataset.bsTarget);
            
            // Hide all tabs
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('show', 'active');
            });
            
            // Deactivate all tabs
            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            
            // Activate current tab
            this.classList.add('active');
            this.setAttribute('aria-selected', 'true');
            
            // Show current tab content
            target.classList.add('show', 'active');
        });
    });
}


