const weatherContainer = document.querySelector('.weather-placeholder');

// Get trip data from session storage


function populatePlaces(places) {
    const placesContainer = document.getElementById('places-container');
    placesContainer.innerHTML = '';

    if (!places || places.length === 0) {
        placesContainer.innerHTML = '<p class="text-center">No places found for this destination.</p>';
        return;
    }

    places.forEach((place, index) => {
        const card = document.createElement('div');
        card.className = 'card mb-3';
        card.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${place.name}</h5>
                <p class="card-text"><strong>Description:</strong> ${place.description}</p>
                <p class="card-text"><strong>Category:</strong> ${place.category}</p>
                <p class="card-text"><strong>Rating:</strong> ${place.rating} ⭐</p>
                <p class="card-text"><strong>Visit Duration:</strong> ${place.visitDuration}</p>
                <p class="card-text"><strong>Best Time to Visit:</strong> ${place.bestTimeToVisit}</p>
            </div>
        `;
        placesContainer.appendChild(card);
    });
}

function initMap(places, destination) {
    const mapContainer = document.querySelector('.map-placeholder');

    // Create a map centered on the destination
    const map = new google.maps.Map(mapContainer, {
        center: { lat: 0, lng: 0 },
        zoom: 13
    });

    // Geocode the destination to get its coordinates
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: destination }, function (results, status) {
        if (status === 'OK') {
            map.setCenter(results[0].geometry.location);

            // Add markers for each place
            places.forEach(place => {
                if (place.coordinates) {
                    addMarker(place.coordinates.lat, place.coordinates.lng, place.name);
                } else {
                    geocoder.geocode({ address: place.name + ', ' + destination }, function (results, status) {
                        if (status === 'OK') {
                            addMarker(
                                results[0].geometry.location.lat(),
                                results[0].geometry.location.lng(),
                                place.name
                            );
                        }
                    });
                }
            });
        } else {
            mapContainer.innerHTML = `<div class="alert alert-warning">Could not load map for ${destination}</div>`;
        }
    });

    function addMarker(lat, lng, title) {
        new google.maps.Marker({
            position: { lat, lng },
            map: map,
            title: title
        });
    }
}

async function fetchWeather(lat, lon, destination) {
    const apiKey = "c8d47b3c69227c3bba7dd17a791dc037"; // OpenWeather API Key

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
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
            <h5 class="mb-3">Weather Forecast for ${destination}</h5>
            <div class="row">
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

document.addEventListener('DOMContentLoaded', async function () {
const tripData = JSON.parse(sessionStorage.getItem('tripData'));
console.log("Trip Data:", tripData);

if (!tripData) {
    window.location.href = 'trip-planner.html';
}

try {
    // Fetch itinerary data
    const response = await fetch(`/api/itinerary?destination=${encodeURIComponent(tripData.destination)}&days=${tripData.days}`);
    if (!response.ok) {
        throw new Error('Failed to fetch itinerary data');
    }

    const data = await response.json();

    console.log("Initializing map with destination:", tripData.destination);

    populatePlaces(data.places);

    // Initialize map
    initMap(data.places, tripData.destination);

    // Fetch and display weather using latitude and longitude
    if (tripData.latitude && tripData.longitude) {
        fetchWeather(tripData.latitude, tripData.longitude, tripData.destination);
    } else {
        weatherContainer.innerHTML = '<p>Weather data not available</p>';
    }
} catch (error) {
    console.error('Error:', error);
    document.getElementById('places-container').innerHTML = `
            <div class="alert alert-danger">
                Failed to load itinerary data. Please try again.
            </div>
        `;
}
});