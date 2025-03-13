// frontend/js/main.js

document.addEventListener("DOMContentLoaded", function () {
    // Initialize Google Maps API
    loadGoogleMapsAPI(() => {
        console.log("Google Maps API Loaded!");
        initPlacesAutocomplete();
    });

    // Handle trip planner form submission
    const tripForm = document.getElementById("trip-form");
    if (tripForm) {
        tripForm.addEventListener("submit", async function (e) {
            e.preventDefault();

               // Collect user input
            const destination = document.getElementById("destination").value;
            const days = document.getElementById("days").value;
            const budget = document.getElementById("budget").value;

            const interests = [];
            document.querySelectorAll("input[type=checkbox]:checked").forEach((checkbox) => {
                interests.push(checkbox.id);
            });

            const tripData = { destination, days, interests, budget };

            try {
                // Show loading state
                const submitBtn = document.getElementById("trip-submit");
                submitBtn.innerHTML = "Planning your trip...";
                submitBtn.disabled = true;

                const response = await fetch("http://localhost:5000/api/trip/plan", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(tripData)
                });

                if (!response.ok) {
                    throw new Error("Failed to plan trip");
                }

                const result = await response.json();
                console.log("Trip Planned:", result);
                
                // Redirect to itinerary page with trip ID
                window.location.href = `itinerary.html?tripId=${result._id}`;
            } catch (error) {
                console.error("Error:", error);
                alert("Error planning trip. Please try again.");
            } finally {
                // Reset button state
                const submitBtn = document.getElementById("trip-submit");
                submitBtn.innerHTML = "Generate Itinerary";
                submitBtn.disabled = false;
            }
        });
    }

    // Handle itinerary page
    const placesContainer = document.getElementById("places-container");
    if (placesContainer) {
        loadItineraryData();
    }

    // Handle transport guidance page
    const transportOptionsContainer = document.getElementById("transport-options-container");
    if (transportOptionsContainer) {
        loadTransportOptions();
    }

    // Handle save transport selections
    const saveTransportBtn = document.getElementById("save-transport");
    if (saveTransportBtn) {
        saveTransportBtn.addEventListener("click", async function() {
            const selectedTransport = document.querySelector('input[name="transportOption"]:checked');
            if (!selectedTransport) {
                alert("Please select a transport option");
                return;
            }
            
            const urlParams = new URLSearchParams(window.location.search);
            const tripId = urlParams.get('tripId');
            
            try {
                const response = await fetch(`http://localhost:5001/api/trip/${tripId}/transport`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        transportType: selectedTransport.id.replace('Option', '') 
                    })
                });
                
                if (!response.ok) {
                    throw new Error("Failed to save transport selection");
                }
                
                alert("Your transport selections have been saved!");
                window.location.href = `itinerary.html?tripId=${tripId}`;
            } catch (error) {
                console.error("Error saving transport selection:", error);
                alert("Error saving selection. Please try again.");
            }
        });
    }

    // Handle auth form submission
    const authForm = document.getElementById("auth-form");
    if (authForm) {
        authForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const isSignup = document.getElementById("form-title").textContent === "Create account";
            const name = isSignup ? document.querySelector("#name-field input").value : null;
            const email = document.querySelector("input[type='email']").value;
            const password = document.querySelector("input[type='password']").value;
            const confirmPassword = isSignup ? document.querySelector("#confirm-password-field input").value : null;

            if (isSignup && password !== confirmPassword) {
                alert("Passwords do not match!");
                return;
            }

            const endpoint = isSignup ? "/api/auth/register" : "/api/auth/login";
            const body = isSignup ? { name, email, password } : { email, password };

            try {
                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                    credentials: "include", // Important for cookies
                });

                const data = await response.json();

                if (response.ok) {
                    alert(data.message);
                    if (!isSignup) {
                        window.location.href = "/frontend/pages/dashboard.html"; // Redirect after login
                    } else {
                        window.location.href = "login.html"; // Redirect to login page after signup
                    }
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error("Error:", error);
                alert("Something went wrong. Please try again.");
            }
        });
    }
});

// Logout function
async function logout() {
    try {
        const response = await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
        });

        if (response.ok) {
            window.location.href = "login.html"; // Redirect to login
        } else {
            alert("Logout failed");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

// Initialize Google Places Autocomplete for destination input
function initPlacesAutocomplete() {
    const destinationInput = document.getElementById("destination");
    if (destinationInput && window.google) {
        const autocomplete = new google.maps.places.Autocomplete(destinationInput);
        autocomplete.addListener("place_changed", function() {
            const place = autocomplete.getPlace();
            if (!place.geometry) {
                console.log("No details available for input: " + place.name);
                return;
            }
            
            // Store place details if needed
            console.log("Selected place:", place.name);
        });
    }
}

// Function to load itinerary data from API
async function loadItineraryData() {
    try {
        // Get trip ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const tripId = urlParams.get('tripId');
        
        if (!tripId) {
            throw new Error("No trip ID found");
        }
        
        // Show loading indicators
        document.querySelector(".map-placeholder").innerHTML = "Loading map...";
        document.querySelector(".weather-placeholder").innerHTML = "Loading weather data...";
        document.getElementById("places-container").innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading places...</p>
            </div>
        `;
        
        // Fetch trip data from API
        const response = await fetch(`http://localhost:5001/api/trip/${tripId}`);
        
        if (!response.ok) {
            throw new Error("Failed to fetch trip data");
        }
        
        const tripData = await response.json();
        console.log("Trip data loaded:", tripData);
        
        // Initialize the map with the destination
        initMap(tripData.destination);
        
        // Load weather data
        loadWeatherData(tripData.destination);
        
        // Display places to visit
        displayPlaces(tripData.places);
        
    } catch (error) {
        console.error("Error loading itinerary:", error);
        document.getElementById("places-container").innerHTML = `
            <div class="alert alert-danger">
                Error loading itinerary data: ${error.message}
                <br><a href="trip-planner.html" class="btn btn-primary mt-2">Return to Trip Planner</a>
            </div>
        `;
    }
}

// Function to initialize Google Maps
function initMap(destination) {
    if (!window.google) {
        console.log("Google Maps API not loaded yet");
        const mapLoadInterval = setInterval(function() {
            if (window.google) {
                clearInterval(mapLoadInterval);
                initMap(destination);
            }
        }, 500);
        return;
    }
    
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: destination }, function(results, status) {
        if (status === "OK") {
            const mapDiv = document.querySelector(".map-placeholder");
            mapDiv.innerHTML = "";
            
            const map = new google.maps.Map(mapDiv, {
                center: results[0].geometry.location,
                zoom: 12
            });
            
            // Add marker for the destination
            new google.maps.Marker({
                position: results[0].geometry.location,
                map: map,
                title: destination
            });
        } else {
            console.error("Geocode failed:", status);
            document.querySelector(".map-placeholder").innerHTML = "Failed to load map. Please try again.";
        }
    });
}

// Function to load weather data from OpenWeather API
async function loadWeatherData(destination) {
    try {
        const weatherContainer = document.querySelector(".weather-placeholder");
        
        // Fetch weather data from API
        const response = await fetch(`http://localhost:5001/api/weather?location=${encodeURIComponent(destination)}`);
        
        if (!response.ok) {
            throw new Error("Failed to fetch weather data");
        }
        
        const weatherData = await response.json();
        console.log("Weather data loaded:", weatherData);
        
        let weatherHTML = `
            <div class="container">
                <div class="row">
                    <div class="col-md-4 border-end">
                        <h5>${destination} Weather</h5>
                        <div class="display-4">${weatherData.current.temp}°C</div>
                        <p>${weatherData.current.description}</p>
                        <p>Humidity: ${weatherData.current.humidity}%</p>
                    </div>
                    <div class="col-md-8">
                        <div class="row">
        `;
        
        weatherData.forecast.forEach(day => {
            weatherHTML += `
                <div class="col text-center">
                    <div class="h5">${day.day}</div>
                    <div class="display-6">${day.icon}</div>
                    <div>${day.temp}°C</div>
                </div>
            `;
        });
        
        weatherHTML += `
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        weatherContainer.innerHTML = weatherHTML;
        
    } catch (error) {
        console.error("Error loading weather:", error);
        document.querySelector(".weather-placeholder").innerHTML = "Failed to load weather data.";
    }
}

// Function to display places to visit
function displayPlaces(places) {
    const placesContainer = document.getElementById("places-container");
    
    if (!places || places.length === 0) {
        placesContainer.innerHTML = `
            <div class="alert alert-warning">
                No places found for this destination. Try modifying your trip preferences.
            </div>
        `;
        return;
    }
    
    let placesHTML = "";
    
    places.forEach((place, index) => {
        placesHTML += `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-8">
                            <h5 class="card-title">${place.name}</h5>
                            <h6 class="card-subtitle mb-2 text-muted">${place.type}</h6>
                            <p class="card-text">${place.description}</p>
                            <div class="d-flex justify-content-between">
                                <span>⭐ ${place.rating}</span>
                                <span>⏱️ ${place.visitDuration}</span>
                            </div>
                        </div>
                        <div class="col-md-4 d-flex align-items-center justify-content-center">
                            ${place.photo ? 
                                `<img src="${place.photo}" alt="${place.name}" class="img-fluid rounded" style="max-width:100%;max-height:150px;">` : 
                                `<div style="width:100px;height:100px;background:#e9ecef;display:flex;align-items:center;justify-content:center;border-radius:5px;">
                                    Place Image
                                </div>`
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    placesContainer.innerHTML = placesHTML;
}

// Function to load transport options
async function loadTransportOptions() {
    try {
        // Get trip ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const tripId = urlParams.get('tripId');
        
        if (!tripId) {
            throw new Error("No trip ID found");
        }
        
        // Show loading indicators
        document.getElementById("journey-details").innerHTML = `
            <div class="text-center py-3">
                <div class="spinner-border text-light" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading journey details...</p>
            </div>
        `;
        
        document.getElementById("transport-options-container").innerHTML = `
            <div class="text-center py-3">
                <div class="spinner-border text-light" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading transport options...</p>
            </div>
        `;
        
        // Fetch trip data from API
        const tripResponse = await fetch(`http://localhost:5001/api/trip/${tripId}`);
        
        if (!tripResponse.ok) {
            throw new Error("Failed to fetch trip data");
        }
        
        const tripData = await tripResponse.json();
        console.log("Trip data loaded:", tripData);
        
        // Display journey details
        const journeyContainer = document.getElementById("journey-details");
        journeyContainer.innerHTML = `
            <h5>Destination: ${tripData.destination}</h5>
            <p>Duration: ${tripData.days} days</p>
            <p>Budget: ₹${tripData.budget}</p>
        `;
        
        // Fetch transport options from API
        const transportResponse = await fetch(`http://localhost:5001/api/trip/${tripId}/transport-options`);
        
        if (!transportResponse.ok) {
            throw new Error("Failed to fetch transport options");
        }
        
        const transportOptions = await transportResponse.json();
        console.log("Transport options loaded:", transportOptions);
        
        // Display transport options
        const transportContainer = document.getElementById("transport-options-container");
        let transportHTML = "";
        
        transportOptions.forEach(option => {
            transportHTML += `
                <div class="transport-option">
                    <div class="d-flex">
                        <div class="icon-container">
                            <span style="font-size: 24px;">${option.icon}</span>
                        </div>
                        <div class="flex-grow-1">
                            <div class="d-flex justify-content-between">
                                <h5>${option.type}</h5>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="transportOption" id="${option.type.toLowerCase()}Option">
                                </div>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span>₹${option.price}</span>
                                <span>${option.duration}</span>
                            </div>
                            <p class="mb-0">${option.description}</p>
                        </div>
                    </div>
                </div>
            `;
        });
        
        transportContainer.innerHTML = transportHTML;
        
        // Display cost breakdown
        const costContainer = document.getElementById("cost-breakdown");
        
        // Fetch budget details from API
        const budgetResponse = await fetch(`http://localhost:5001/api/trip/${tripId}/budget`);
        
        if (!budgetResponse.ok) {
            throw new Error("Failed to fetch budget details");
        }
        
        const budgetDetails = await budgetResponse.json();
        console.log("Budget details loaded:", budgetDetails);
        
        costContainer.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h5>Budget Breakdown</h5>
                    <div class="progress mb-3" style="height: 25px;">
                        <div class="progress-bar bg-primary" style="width: ${budgetDetails.transportPercentage}%">Transport</div>
                        <div class="progress-bar bg-success" style="width: ${budgetDetails.accommodationPercentage}%">Accommodation</div>
                        <div class="progress-bar bg-info" style="width: ${budgetDetails.foodPercentage}%">Food</div>
                        <div class="progress-bar bg-warning" style="width: ${budgetDetails.activitiesPercentage}%">Activities</div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="d-flex justify-content-between mb-2">
                        <span>Transport:</span>
                        <span>₹${budgetDetails.transportCost} (${budgetDetails.transportPercentage}%)</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Accommodation:</span>
                        <span>₹${budgetDetails.accommodationCost} (${budgetDetails.accommodationPercentage}%)</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Food:</span>
                        <span>₹${budgetDetails.foodCost} (${budgetDetails.foodPercentage}%)</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Activities:</span>
                        <span>₹${budgetDetails.activitiesCost} (${budgetDetails.activitiesPercentage}%)</span>
                    </div>
                    <div class="d-flex justify-content-between mt-3 pt-2 border-top">
                        <span><strong>Total:</strong></span>
                        <span><strong>₹${tripData.budget}</strong></span>
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error("Error loading transport options:", error);
        document.getElementById("transport-options-container").innerHTML = `
            <div class="alert alert-danger">
                Error loading transport data: ${error.message}
                <br><a href="trip-planner.html" class="btn btn-primary mt-2">Return to Trip Planner</a>
            </div>
        `;
    }
}

// Function to load Google Maps API
function loadGoogleMapsAPI(callback) {
    if (window.google && window.google.maps) {
        callback(); // API already loaded, execute callback
        return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA2BTwd5ikgfxasNa-TDh-ZZY-az8XhPng&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = callback; // Run callback once loaded
    document.head.appendChild(script);
}


