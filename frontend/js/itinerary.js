// frontend/js/itinerary.js
document.addEventListener('DOMContentLoaded', async function () {
    // Get trip data from session storage
    const tripData = JSON.parse(sessionStorage.getItem('tripData'));
    if (!tripData) {
        window.location.href = 'trip-planner.html';
        return;
    }

    try {
        // Fetch itinerary data
        const response = await fetch(`/api/itinerary?destination=${encodeURIComponent(tripData.destination)}&days=${tripData.days}`);
        if (!response.ok) {
            throw new Error('Failed to fetch itinerary data');
        }

        const data = await response.json();

        // Populate places
        populatePlaces(data.places);

        // Initialize map
        initMap(data.places, tripData.destination);

        // Initialize weather
        initWeather(tripData.destination, data.weather);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('places-container').innerHTML = `
            <div class="alert alert-danger">
                Failed to load itinerary data. Please try again.
            </div>
        `;
    }
});

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
        zoom: 13,
        center: { lat: 0, lng: 0 }
    });

    // Geocode the destination to get its coordinates
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: destination }, function (results, status) {
        if (status === 'OK') {
            map.setCenter(results[0].geometry.location);

            // Add markers for each place
            places.forEach(place => {
                // If place has coordinates, use them; otherwise, geocode the place name
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

function initWeather(destination, weatherData) {
    const weatherContainer = document.querySelector('.weather-placeholder');

    if (!weatherData) {
        weatherContainer.innerHTML = '<p>Weather data not available</p>';
        return;
    }

    let weatherHTML = `
        <div class="container">
            <h5 class="mb-3">Weather Forecast for ${destination}</h5>
            <div class="row">
    `;

    weatherData.forecast.forEach(day => {
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
