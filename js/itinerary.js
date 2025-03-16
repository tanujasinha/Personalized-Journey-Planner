// js/itinerary.js

const weatherContainer = document.querySelector('.weather-placeholder');
const tripData = JSON.parse(sessionStorage.getItem('tripData'));
console.log("Trip Data:", tripData);

document.addEventListener('DOMContentLoaded', async function () {
    if (!tripData) {
        window.location.href = 'trip-planner.html';
        return;
    }

    // Add save/download buttons
    addActionButtons();

    // Initialize the map
    initMap(tripData.latitude, tripData.longitude);

    // Fetch and display places
    await fetchAndDisplayPlaces(tripData);

    // Fetch weather data
    await fetchWeather(tripData.latitude, tripData.longitude, tripData.destination);
});

// Add save and download buttons
function addActionButtons() {
    const actionContainer = document.getElementById('action-buttons');
    if (!actionContainer) return;

    actionContainer.innerHTML = `
        <button id="save-trip-btn" class="btn btn-primary">
            <i class="bi bi-bookmark"></i> Save Trip
        </button>
        <button id="download-itinerary-btn" class="btn btn-success">
            <i class="bi bi-file-earmark-arrow-down"></i> Download Itinerary
        </button>
    `;

    // Add event listeners
    document.getElementById('save-trip-btn').addEventListener('click', saveTrip);
    document.getElementById('download-itinerary-btn').addEventListener('click', downloadItinerary);
}

// Save trip to user account
function saveTrip() {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        showLoginModal();
        return;
    }

    // API call would go here to save trip to user's account
    showAlert('Trip saved successfully!', 'success');
}

// Download itinerary as PDF
function downloadItinerary() {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        showLoginModal();
        return;
    }

    // In a real implementation, use a library like html2pdf.js
    showAlert('Downloading your itinerary...', 'info');
    
    // Simulate download delay
    setTimeout(() => {
        showAlert('Itinerary downloaded successfully!', 'success');
    }, 1500);
}

// Show login modal
function showLoginModal() {
    const modalHTML = `
        <div class="modal fade" id="loginRequiredModal" tabindex="-1" aria-labelledby="loginModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title" id="loginModalLabel">Login Required</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>You need to be logged in to use this feature.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <a href="login.html" class="btn btn-primary">Log In</a>
                        <a href="signup.html" class="btn btn-success">Sign Up</a>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add modal to page if it doesn't exist
    if (!document.getElementById('loginRequiredModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Show modal
    const loginModal = new bootstrap.Modal(document.getElementById('loginRequiredModal'));
    loginModal.show();
}

// Show alert message
function showAlert(message, type) {
    const alertContainer = document.getElementById('alert-container');
    if (!alertContainer) return;

    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    alertContainer.appendChild(alert);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

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
        weatherContainer.innerHTML = '<div class="alert alert-warning">Weather data not available</div>';
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
                windSpeed: entry.wind.speed,
                icon: entry.weather[0].icon // Get weather icon code
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
        <h5 class="mb-3 text-center">${destination}</h5>
        <div class="row justify-content-center">
    `;

    forecast.forEach(day => {
        // Format date to be more readable
        const formattedDate = new Date(day.date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });

        // Get weather icon
        const iconUrl = `https://openweathermap.org/img/wn/${day.icon}@2x.png`;

        weatherHTML += `
        <div class="col-md-3 col-6 text-center mb-3">
            <div class="card h-100 shadow-sm">
                <div class="card-header bg-info text-white">
                    <h6 class="mb-0">${formattedDate}</h6>
                </div>
                <div class="card-body">
                    <img src="${iconUrl}" alt="${day.description}" class="weather-icon mb-2">
                    <div class="display-6">${Math.round(day.temperature)}°C</div>
                    <p class="text-capitalize">${day.description}</p>
                    <div class="d-flex justify-content-around text-muted small">
                        <span><i class="bi bi-droplet"></i> ${day.humidity}%</span>
                        <span><i class="bi bi-wind"></i> ${day.windSpeed} km/h</span>
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
        placesContainer.innerHTML = '<div class="alert alert-warning">Please select at least one interest to see recommendations.</div>';
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
        placesContainer.innerHTML = '<div class="alert alert-warning">No places found for your interests in this location.</div>';
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
                    <i class="bi bi-calendar-day"></i> Day ${day}
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
                
                // Get image - use unsplash for better placeholder images
                let imageUrl;
                
                // Try to get photo from Foursquare API response
                if (place.photos && place.photos.length > 0 && place.photos[0].prefix && place.photos[0].suffix) {
                    imageUrl = `${place.photos[0].prefix}300x200${place.photos[0].suffix}`;
                } else {
                    // Use category-based placeholder from Unsplash
                    const categoryMap = {
                        'Restaurant': 'restaurant',
                        'Café': 'cafe',
                        'Museum': 'museum',
                        'Park': 'park',
                        'Monument': 'monument',
                        'Temple': 'temple',
                        'Beach': 'beach',
                        'Market': 'market'
                    };
                    
                    const searchTerm = categoryMap[category] || 'travel';
                    imageUrl = `https://source.unsplash.com/300x200/?${searchTerm}`;
                }
                
                // Create icon for categories
                const categoryIcons = {
                    'Restaurant': 'bi-cup-hot',
                    'Café': 'bi-cup',
                    'Museum': 'bi-building',
                    'Park': 'bi-tree',
                    'Monument': 'bi-bank',
                    'Temple': 'bi-house',
                    'Beach': 'bi-water',
                    'Market': 'bi-shop',
                    'Hotel': 'bi-house-door',
                    'Bar': 'bi-cup-straw'
                };
                
                const iconClass = categoryIcons[category] || 'bi-geo-alt';
                
                itineraryHTML += `
                    <div class="col-md-6 mb-3">
                        <div class="card h-100 shadow">
                            <div class="card-header bg-primary text-white">
                                <i class="bi bi-clock"></i> ${timeSlot}
                            </div>
                            <img src="${imageUrl}" class="card-img-top" alt="${name}" 
                                style="height: 200px; object-fit: cover;"
                                onerror="this.onerror=null; this.src='https://source.unsplash.com/300x200/?travel';">
                            <div class="card-body">
                                <h5 class="card-title">${name}</h5>
                                <h6 class="card-subtitle mb-2 text-muted">
                                    <i class="bi ${iconClass}"></i> ${category}
                                </h6>
                                <p class="card-text">
                                    <i class="bi bi-geo-alt"></i> ${address}
                                </p>
                                ${place.tel ? `<p><small><i class="bi bi-telephone"></i> ${place.tel}</small></p>` : ''}
                                ${place.website ? `<a href="${place.website}" target="_blank" class="btn btn-sm btn-outline-primary">
                                    <i class="bi bi-globe"></i> Visit Website
                                </a>` : ''}
                                <a href="https://maps.google.com/?q=${name}, ${address}" target="_blank" class="btn btn-sm btn-outline-success ms-2">
                                    <i class="bi bi-map"></i> Directions
                                </a>
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
        <div class="card mt-4 shadow">
            <div class="card-header bg-warning text-dark">
                <h5 class="mb-0"><i class="bi bi-cash-coin"></i> Budget Estimation</h5>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>Total budget:</strong> ₹${Number(tripData.budget).toLocaleString()}</p>
                        <p><strong>Estimated daily expense:</strong> ₹${Math.round(tripData.budget / tripData.days).toLocaleString()}</p>
                    </div>
                    <div class="col-md-6">
                        <div class="alert alert-info mb-0">
                            <small>This is a rough estimate. Actual expenses may vary based on your choices.</small>
                        </div>
                    </div>
                </div>
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