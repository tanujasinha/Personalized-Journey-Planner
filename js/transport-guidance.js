//js/transport-guidance.js

document.addEventListener('DOMContentLoaded', function() {
    fetch("/api/check-auth", { credentials: "include" })
    .then(response => response.json())
    .then(data => {
      if (!data.isAuthenticated) {
       document.querySelector('.back-link').style.display="none";
      } 
    })
    .catch(error => console.error("Error checking auth:", error));
    // Reference to all buttons
    const transportButtons = document.querySelectorAll('.btn-custom');
    
    // Current location variables
    let userLatitude, userLongitude;
    
    // Get user's current location if permitted
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            userLatitude = position.coords.latitude;
            userLongitude = position.coords.longitude;
            console.log(`Location obtained: ${userLatitude}, ${userLongitude}`);
        }, error => {
            console.error("Error getting location:", error);
            // Default to New Delhi coordinates if location access denied
            userLatitude = 28.6139;
            userLongitude = 77.2090;
        });
    } else {
        console.log("Geolocation not supported by this browser");
        // Default to New Delhi coordinates
        userLatitude = 28.6139;
        userLongitude = 77.2090;
    }
    
    // Add click event listeners to all transport buttons
    transportButtons.forEach(button => {
        button.addEventListener('click', function() {
            const transportType = this.getAttribute('data-type');
            handleTransportSelection(transportType);
        });
    });
    
    // Handle transport selection based on type
    function handleTransportSelection(type) {
        // First create or get modal container
        let modalContainer = document.getElementById('transport-modal');
        if (!modalContainer) {
            modalContainer = createModalContainer();
        }
        
        // Clear previous content
        const modalBody = modalContainer.querySelector('.modal-body');
        modalBody.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>';
        
        // Update modal title
        const modalTitle = modalContainer.querySelector('.modal-title');
        modalTitle.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} Search`;
        
        // Show the modal
        const bsModal = new bootstrap.Modal(modalContainer);
        bsModal.show();
        
        // Get data based on transport type
        switch(type) {
            case 'flights':
                fetchFlightData(modalBody);
                break;
            case 'trains':
                fetchTrainData(modalBody);
                break;
            case 'buses':
                fetchBusData(modalBody);
                break;
            case 'taxis':
                fetchTaxiData(modalBody);
                break;
        }
    }
    
    // Create modal container for displaying results
    function createModalContainer() {
        const modalHTML = `
            <div class="modal fade" id="transport-modal" tabindex="-1" aria-labelledby="transportModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="transportModalLabel">Transport Search</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <!-- Content will be dynamically inserted here -->
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" id="book-button">Book Now</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
        
        // Add event listener to the book button
        const bookButton = modalContainer.querySelector('#book-button');
        bookButton.addEventListener('click', function() {
            alert('This is a demo. Booking functionality would be implemented here.');
        });
        
        return modalContainer.querySelector('#transport-modal');
    }
    
    // Function to fetch flight data using OpenSky Network API
    // This API provides real-time aircraft data, not commercial flight searches
    function fetchFlightData(container) {
        // Create search form
        const searchForm = `
            <form id="flight-search-form" class="mb-4">
                <div class="row g-3">
                    <div class="col-md-6">
                        <label for="origin" class="form-label">From</label>
                        <select class="form-select" id="origin" required>
                            <option value="" selected disabled>Select origin city</option>
                            <option value="DEL">Delhi (DEL)</option>
                            <option value="BOM">Mumbai (BOM)</option>
                            <option value="MAA">Chennai (MAA)</option>
                            <option value="CCU">Kolkata (CCU)</option>
                            <option value="BLR">Bangalore (BLR)</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label for="destination" class="form-label">To</label>
                        <select class="form-select" id="destination" required>
                            <option value="" selected disabled>Select destination city</option>
                            <option value="DEL">Delhi (DEL)</option>
                            <option value="BOM">Mumbai (BOM)</option>
                            <option value="MAA">Chennai (MAA)</option>
                            <option value="CCU">Kolkata (CCU)</option>
                            <option value="BLR">Bangalore (BLR)</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label for="departure-date" class="form-label">Departure Date</label>
                        <input type="date" class="form-control" id="departure-date" required>
                    </div>
                    <div class="col-md-6">
                        <label for="passengers" class="form-label">Passengers</label>
                        <input type="number" class="form-control" id="passengers" min="1" max="10" value="1" required>
                    </div>
                    <div class="col-12">
                        <button type="submit" class="btn btn-primary">Search Flights</button>
                    </div>
                </div>
            </form>
            <div id="flight-results"></div>
        `;
        
        container.innerHTML = searchForm;
        
        // Add form submission handler
        document.getElementById('flight-search-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const origin = document.getElementById('origin').value;
            const destination = document.getElementById('destination').value;
            const departureDate = document.getElementById('departure-date').value;
            const passengers = document.getElementById('passengers').value;
            
            // Display mock flight search results (since we're not actually querying an API)
            displayMockFlightResults(origin, destination, departureDate, passengers);
        });
        
        function displayMockFlightResults(origin, destination, date, passengers) {
            const resultsContainer = document.getElementById('flight-results');
            
            // Format date for display
            const formattedDate = new Date(date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
            
            // Generate mock flight results
            const flights = [
                {
                    airline: "Air India",
                    flightNumber: "AI" + Math.floor(Math.random() * 1000),
                    departureTime: "06:30",
                    arrivalTime: "08:45",
                    duration: "2h 15m",
                    price: Math.floor(4000 + Math.random() * 3000)
                },
                {
                    airline: "IndiGo",
                    flightNumber: "6E" + Math.floor(Math.random() * 1000),
                    departureTime: "09:15",
                    arrivalTime: "11:20",
                    duration: "2h 05m",
                    price: Math.floor(3500 + Math.random() * 2500)
                },
                {
                    airline: "SpiceJet",
                    flightNumber: "SG" + Math.floor(Math.random() * 1000),
                    departureTime: "13:45",
                    arrivalTime: "16:00",
                    duration: "2h 15m",
                    price: Math.floor(3000 + Math.random() * 2000)
                }
            ];
            
            // Create results HTML
            let resultsHTML = `
                <h5 class="mt-4">Flights from ${origin} to ${destination} on ${formattedDate} for ${passengers} passenger(s)</h5>
                <div class="list-group">
            `;
            
            flights.forEach(flight => {
                resultsHTML += `
                    <div class="list-group-item list-group-item-action">
                        <div class="d-flex w-100 justify-content-between">
                            <h5 class="mb-1">${flight.airline} - ${flight.flightNumber}</h5>
                            <strong>₹${flight.price}</strong>
                        </div>
                        <div class="d-flex justify-content-between">
                            <div>
                                <p class="mb-1">${origin} ${flight.departureTime} → ${destination} ${flight.arrivalTime}</p>
                                <small>Duration: ${flight.duration}</small>
                            </div>
                            <div>
                                <button class="btn btn-sm btn-outline-primary select-flight">Select</button>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            resultsHTML += `</div>`;
            resultsContainer.innerHTML = resultsHTML;
            
            // Add event listeners to select buttons
            const selectButtons = document.querySelectorAll('.select-flight');
            selectButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const flightItem = this.closest('.list-group-item');
                    
                    // Remove active class from all items
                    document.querySelectorAll('.list-group-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    
                    // Add active class to selected item
                    flightItem.classList.add('active');
                });
            });
        }
    }
    
    // Function to fetch train data (using IRCTC API in a real scenario)
    function fetchTrainData(container) {
        // Create search form for trains
        const searchForm = `
            <form id="train-search-form" class="mb-4">
                <div class="row g-3">
                    <div class="col-md-6">
                        <label for="train-origin" class="form-label">From</label>
                        <select class="form-select" id="train-origin" required>
                            <option value="" selected disabled>Select origin station</option>
                            <option value="NDLS">New Delhi (NDLS)</option>
                            <option value="BCT">Mumbai Central (BCT)</option>
                            <option value="MAS">Chennai Central (MAS)</option>
                            <option value="HWH">Howrah (HWH)</option>
                            <option value="SBC">Bangalore (SBC)</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label for="train-destination" class="form-label">To</label>
                        <select class="form-select" id="train-destination" required>
                            <option value="" selected disabled>Select destination station</option>
                            <option value="NDLS">New Delhi (NDLS)</option>
                            <option value="BCT">Mumbai Central (BCT)</option>
                            <option value="MAS">Chennai Central (MAS)</option>
                            <option value="HWH">Howrah (HWH)</option>
                            <option value="SBC">Bangalore (SBC)</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label for="train-date" class="form-label">Journey Date</label>
                        <input type="date" class="form-control" id="train-date" required>
                    </div>
                    <div class="col-md-6">
                        <label for="train-class" class="form-label">Class</label>
                        <select class="form-select" id="train-class" required>
                            <option value="SL">Sleeper (SL)</option>
                            <option value="3A">AC 3 Tier (3A)</option>
                            <option value="2A">AC 2 Tier (2A)</option>
                            <option value="1A">AC First Class (1A)</option>
                            <option value="CC">Chair Car (CC)</option>
                        </select>
                    </div>
                    <div class="col-12">
                        <button type="submit" class="btn btn-primary">Search Trains</button>
                    </div>
                </div>
            </form>
            <div id="train-results"></div>
        `;
        
        container.innerHTML = searchForm;
        
        // Add form submission handler
        document.getElementById('train-search-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const origin = document.getElementById('train-origin').value;
            const destination = document.getElementById('train-destination').value;
            const journeyDate = document.getElementById('train-date').value;
            const travelClass = document.getElementById('train-class').value;
            
            // Display mock train search results
            displayMockTrainResults(origin, destination, journeyDate, travelClass);
        });
        
        function displayMockTrainResults(origin, destination, date, travelClass) {
            const resultsContainer = document.getElementById('train-results');
            
            // Format date for display
            const formattedDate = new Date(date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
            
            // Generate mock train results
            const trains = [
                {
                    name: "Rajdhani Express",
                    number: "12301",
                    departureTime: "16:50",
                    arrivalTime: "10:20",
                    duration: "17h 30m",
                    price: Math.floor(1500 + Math.random() * 1000),
                    availability: "Available"
                },
                {
                    name: "Shatabdi Express",
                    number: "12007",
                    departureTime: "06:15",
                    arrivalTime: "13:45",
                    duration: "7h 30m",
                    price: Math.floor(1200 + Math.random() * 800),
                    availability: "WL 12"
                },
                {
                    name: "Duronto Express",
                    number: "12213",
                    departureTime: "23:00",
                    arrivalTime: "14:30",
                    duration: "15h 30m",
                    price: Math.floor(1300 + Math.random() * 900),
                    availability: "RAC 5"
                }
            ];
            
            // Create results HTML
            let resultsHTML = `
                <h5 class="mt-4">Trains from ${origin} to ${destination} on ${formattedDate} - Class: ${travelClass}</h5>
                <div class="list-group">
            `;
            
            trains.forEach(train => {
                let availabilityClass = "text-success";
                if (train.availability.startsWith("WL")) {
                    availabilityClass = "text-danger";
                } else if (train.availability.startsWith("RAC")) {
                    availabilityClass = "text-warning";
                }
                
                resultsHTML += `
                    <div class="list-group-item list-group-item-action">
                        <div class="d-flex w-100 justify-content-between">
                            <h5 class="mb-1">${train.name} (${train.number})</h5>
                            <strong>₹${train.price}</strong>
                        </div>
                        <div class="d-flex justify-content-between">
                            <div>
                                <p class="mb-1">${origin} ${train.departureTime} → ${destination} ${train.arrivalTime}</p>
                                <small>Duration: ${train.duration} | <span class="${availabilityClass}">${train.availability}</span></small>
                            </div>
                            <div>
                                <button class="btn btn-sm btn-outline-primary select-train">Select</button>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            resultsHTML += `</div>`;
            resultsContainer.innerHTML = resultsHTML;
            
            // Add event listeners to select buttons
            const selectButtons = document.querySelectorAll('.select-train');
            selectButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const trainItem = this.closest('.list-group-item');
                    
                    // Remove active class from all items
                    document.querySelectorAll('.list-group-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    
                    // Add active class to selected item
                    trainItem.classList.add('active');
                });
            });
        }
    }
    
    // Function to fetch bus data
    function fetchBusData(container) {
        // Create search form for buses
        const searchForm = `
            <form id="bus-search-form" class="mb-4">
                <div class="row g-3">
                    <div class="col-md-6">
                        <label for="bus-origin" class="form-label">From</label>
                        <select class="form-select" id="bus-origin" required>
                            <option value="" selected disabled>Select origin city</option>
                            <option value="Delhi">Delhi</option>
                            <option value="Mumbai">Mumbai</option>
                            <option value="Chennai">Chennai</option>
                            <option value="Kolkata">Kolkata</option>
                            <option value="Bangalore">Bangalore</option>
                            <option value="Hyderabad">Hyderabad</option>
                            <option value="Jaipur">Jaipur</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label for="bus-destination" class="form-label">To</label>
                        <select class="form-select" id="bus-destination" required>
                            <option value="" selected disabled>Select destination city</option>
                            <option value="Delhi">Delhi</option>
                            <option value="Mumbai">Mumbai</option>
                            <option value="Chennai">Chennai</option>
                            <option value="Kolkata">Kolkata</option>
                            <option value="Bangalore">Bangalore</option>
                            <option value="Hyderabad">Hyderabad</option>
                            <option value="Jaipur">Jaipur</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label for="bus-date" class="form-label">Journey Date</label>
                        <input type="date" class="form-control" id="bus-date" required>
                    </div>
                    <div class="col-md-6">
                        <label for="bus-type" class="form-label">Bus Type</label>
                        <select class="form-select" id="bus-type">
                            <option value="Any">Any</option>
                            <option value="AC">AC</option>
                            <option value="Non-AC">Non-AC</option>
                            <option value="Sleeper">Sleeper</option>
                            <option value="Volvo">Volvo</option>
                        </select>
                    </div>
                    <div class="col-12">
                        <button type="submit" class="btn btn-primary">Search Buses</button>
                    </div>
                </div>
            </form>
            <div id="bus-results"></div>
        `;
        
        container.innerHTML = searchForm;
        
        // Add form submission handler
        document.getElementById('bus-search-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const origin = document.getElementById('bus-origin').value;
            const destination = document.getElementById('bus-destination').value;
            const journeyDate = document.getElementById('bus-date').value;
            const busType = document.getElementById('bus-type').value;
            
            // Display mock bus search results
            displayMockBusResults(origin, destination, journeyDate, busType);
        });
        
        function displayMockBusResults(origin, destination, date, busType) {
            const resultsContainer = document.getElementById('bus-results');
            
            // Format date for display
            const formattedDate = new Date(date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
            
            // Generate mock bus results
            const buses = [
                {
                    operator: "IntrCity SmartBus",
                    type: "AC Sleeper",
                    departureTime: "21:30",
                    arrivalTime: "06:45",
                    duration: "9h 15m",
                    price: Math.floor(800 + Math.random() * 600),
                    seats: Math.floor(Math.random() * 15) + 5
                },
                {
                    operator: "Neeta Tours and Travels",
                    type: "Volvo A/C Seater",
                    departureTime: "19:00",
                    arrivalTime: "05:30",
                    duration: "10h 30m",
                    price: Math.floor(750 + Math.random() * 550),
                    seats: Math.floor(Math.random() * 20) + 2
                },
                {
                    operator: "SRS Travels",
                    type: "Non-AC Sleeper",
                    departureTime: "22:15",
                    arrivalTime: "08:00",
                    duration: "9h 45m",
                    price: Math.floor(500 + Math.random() * 400),
                    seats: Math.floor(Math.random() * 25) + 1
                }
            ];
            
            // Filter buses based on selected type
            let filteredBuses = buses;
            if (busType !== "Any") {
                filteredBuses = buses.filter(bus => bus.type.includes(busType));
            }
            
            // Create results HTML
            let resultsHTML = `
                <h5 class="mt-4">Buses from ${origin} to ${destination} on ${formattedDate}</h5>
            `;
            
            if (filteredBuses.length === 0) {
                resultsHTML += `<div class="alert alert-info">No buses found for the selected criteria. Try different options.</div>`;
            } else {
                resultsHTML += `<div class="list-group">`;
                
                filteredBuses.forEach(bus => {
                    resultsHTML += `
                        <div class="list-group-item list-group-item-action">
                            <div class="d-flex w-100 justify-content-between">
                                <h5 class="mb-1">${bus.operator}</h5>
                                <strong>₹${bus.price}</strong>
                            </div>
                            <div class="d-flex justify-content-between">
                                <div>
                                    <p class="mb-1">${bus.type} | ${origin} ${bus.departureTime} → ${destination} ${bus.arrivalTime}</p>
                                    <small>Duration: ${bus.duration} | Seats Available: ${bus.seats}</small>
                                </div>
                                <div>
                                    <button class="btn btn-sm btn-outline-primary select-bus">Select</button>
                                </div>
                            </div>
                        </div>
                    `;
                });
                
                resultsHTML += `</div>`;
            }
            
            resultsContainer.innerHTML = resultsHTML;
            
            // Add event listeners to select buttons
            const selectButtons = document.querySelectorAll('.select-bus');
            selectButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const busItem = this.closest('.list-group-item');
                    
                    // Remove active class from all items
                    document.querySelectorAll('.list-group-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    
                    // Add active class to selected item
                    busItem.classList.add('active');
                });
            });
        }
    }
    
    // Function to fetch taxi data
    function fetchTaxiData(container) {
        // Create search form for taxis
        const searchForm = `
            <ul class="nav nav-tabs" id="taxiTabs" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="taxi-tab" data-bs-toggle="tab" data-bs-target="#taxi" type="button" role="tab" aria-controls="taxi" aria-selected="true">Taxi</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="rental-tab" data-bs-toggle="tab" data-bs-target="#rental" type="button" role="tab" aria-controls="rental" aria-selected="false">Car Rental</button>
                </li>
            </ul>
            <div class="tab-content" id="taxiTabContent">
                <div class="tab-pane fade show active" id="taxi" role="tabpanel" aria-labelledby="taxi-tab">
                    <form id="taxi-search-form" class="my-4">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label for="pickup-location" class="form-label">Pickup Location</label>
                                <input type="text" class="form-control" id="pickup-location" placeholder="Enter pickup address" required>
                            </div>
                            <div class="col-md-6">
                                <label for="dropoff-location" class="form-label">Drop-off Location</label>
                                <input type="text" class="form-control" id="dropoff-location" placeholder="Enter destination address" required>
                            </div>
                            <div class="col-md-6">
                                <label for="pickup-date" class="form-label">Pickup Date</label>
                                <input type="date" class="form-control" id="pickup-date" required>
                            </div>
                            <div class="col-md-6">
                                <label for="pickup-time" class="form-label">Pickup Time</label>
                                <input type="time" class="form-control" id="pickup-time" required>
                            </div>
                            <div class="col-12">
                                <button type="submit" class="btn btn-primary">Find Taxis</button>
                            </div>
                        </div>
                    </form>
                    <div id="taxi-results"></div>
                </div>
                <div class="tab-pane fade" id="rental" role="tabpanel" aria-labelledby="rental-tab">
                    <form id="rental-search-form" class="my-4">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label for="rental-city" class="form-label">City</label>
                                <select class="form-select" id="rental-city" required>
                                    <option value="" selected disabled>Select city</option>
                                    <option value="Delhi">Delhi</option>
                                    <option value="Mumbai">Mumbai</option>
                                    <option value="Chennai">Chennai</option>
                                    <option value="Kolkata">Kolkata</option>
                                    <option value="Bangalore">Bangalore</option>
                                    <option value="Hyderabad">Hyderabad</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label for="rental-type" class="form-label">Car Type</label>
                                <select class="form-select" id="rental-type">
                                    <option value="All">All Types</option>
                                    <option value="Economy">Economy</option>
                                    <option value="Compact">Compact</option>
                                    <option value="SUV">SUV</option>
                                    <option value="Luxury">Luxury</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label for="pickup-date-rental" class="form-label">Pickup Date</label>
                                <input type="date" class="form-control" id="pickup-date-rental" required>
                            </div>
                            <div class="col-md-6">
                                <label for="return-date" class="form-label">Return Date</label>
                                <input type="date" class="form-control" id="return-date" required>
                            </div>
                            <div class="col-12">
                                <button type="submit" class="btn btn-primary">Find Rental Cars</button>
                            </div>
                        </div>
                    </form>
                    <div id="rental-results"></div>
                </div>
            </div>
        `;
        
        container.innerHTML = searchForm;
        
        // Add form submission handlers
        document.getElementById('taxi-search-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const pickupLocation = document.getElementById('pickup-location').value;
            const dropoffLocation = document.getElementById('dropoff-location').value;
            const pickupDate = document.getElementById('pickup-date').value;
            const pickupTime = document.getElementById('pickup-time').value;
            
            // Display mock taxi search results
            displayMockTaxiResults(pickupLocation, dropoffLocation, pickupDate, pickupTime);
        });
        
        document.getElementById('rental-search-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const city = document.getElementById('rental-city').value;
            const carType = document.getElementById('rental-type').value;
            const pickupDate = document.getElementById('pickup-date-rental').value;
            const returnDate = document.getElementById('return-date').value;
            
            // Display mock rental car search results
            displayMockRentalResults(city, carType, pickupDate, returnDate);
        });
        
        function displayMockTaxiResults(pickup, dropoff, date, time) {
            const resultsContainer = document.getElementById('taxi-results');
            
            // Format date and time for display
            const formattedDate = new Date(date + 'T' + time).toLocaleString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
            });
            // transport-guidance.js (continued)

            // Generate mock taxi options
            const taxis = [
                {
                    type: "Economy",
                    company: "Ola",
                    fare: Math.floor(300 + Math.random() * 200),
                    estimatedTime: Math.floor(15 + Math.random() * 10) + " mins",
                    rating: (3.5 + Math.random() * 1.5).toFixed(1)
                },
                {
                    type: "Premium",
                    company: "Uber",
                    fare: Math.floor(400 + Math.random() * 250),
                    estimatedTime: Math.floor(12 + Math.random() * 8) + " mins",
                    rating: (3.8 + Math.random() * 1.2).toFixed(1)
                },
                {
                    type: "SUV",
                    company: "Meru",
                    fare: Math.floor(500 + Math.random() * 300),
                    estimatedTime: Math.floor(20 + Math.random() * 15) + " mins",
                    rating: (3.2 + Math.random() * 1.8).toFixed(1)
                }
            ];
            
            // Create results HTML
            let resultsHTML = `
                <h5 class="mt-4">Taxis from ${pickup} to ${dropoff} at ${formattedDate}</h5>
                <div class="list-group">
            `;
            
            taxis.forEach(taxi => {
                resultsHTML += `
                    <div class="list-group-item list-group-item-action">
                        <div class="d-flex w-100 justify-content-between">
                            <h5 class="mb-1">${taxi.company} - ${taxi.type}</h5>
                            <strong>₹${taxi.fare}</strong>
                        </div>
                        <div class="d-flex justify-content-between">
                            <div>
                                <p class="mb-1">Estimated arrival: ${taxi.estimatedTime}</p>
                                <small>Rating: ${taxi.rating}/5.0</small>
                            </div>
                            <div>
                                <button class="btn btn-sm btn-outline-primary select-taxi">Book Now</button>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            resultsHTML += `</div>`;
            resultsContainer.innerHTML = resultsHTML;
            
            // Add event listeners to select buttons
            const selectButtons = document.querySelectorAll('.select-taxi');
            selectButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const taxiItem = this.closest('.list-group-item');
                    
                    // Remove active class from all items
                    document.querySelectorAll('.list-group-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    
                    // Add active class to selected item
                    taxiItem.classList.add('active');
                    
                    // Show a confirmation message
                    const taxiName = taxiItem.querySelector('h5').textContent;
                    alert(`You've selected ${taxiName}. This is a demo - booking would be completed here.`);
                });
            });
        }
        
        function displayMockRentalResults(city, carType, pickupDate, returnDate) {
            const resultsContainer = document.getElementById('rental-results');
            
            // Calculate rental duration in days
            const pickupDateTime = new Date(pickupDate);
            const returnDateTime = new Date(returnDate);
            const durationDays = Math.ceil((returnDateTime - pickupDateTime) / (1000 * 60 * 60 * 24));
            
            // Format dates for display
            const formattedPickupDate = pickupDateTime.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
            
            const formattedReturnDate = returnDateTime.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
            
            // Generate mock rental car options
            const cars = [
                {
                    model: "Hyundai i10",
                    type: "Economy",
                    seats: 5,
                    transmission: "Manual",
                    pricePerDay: Math.floor(800 + Math.random() * 400)
                },
                {
                    model: "Honda City",
                    type: "Compact",
                    seats: 5,
                    transmission: "Automatic",
                    pricePerDay: Math.floor(1200 + Math.random() * 600)
                },
                {
                    model: "Toyota Innova",
                    type: "SUV",
                    seats: 7,
                    transmission: "Manual",
                    pricePerDay: Math.floor(1800 + Math.random() * 800)
                },
                {
                    model: "Mercedes C-Class",
                    type: "Luxury",
                    seats: 5,
                    transmission: "Automatic",
                    pricePerDay: Math.floor(3500 + Math.random() * 1500)
                }
            ];
            
            // Filter cars based on selected type
            let filteredCars = cars;
            if (carType !== "All") {
                filteredCars = cars.filter(car => car.type === carType);
            }
            
            // Create results HTML
            let resultsHTML = `
                <h5 class="mt-4">Rental Cars in ${city} from ${formattedPickupDate} to ${formattedReturnDate} (${durationDays} days)</h5>
            `;
            
            if (filteredCars.length === 0) {
                resultsHTML += `<div class="alert alert-info">No cars found for the selected criteria. Try different options.</div>`;
            } else {
                resultsHTML += `<div class="list-group">`;
                
                filteredCars.forEach(car => {
                    const totalPrice = car.pricePerDay * durationDays;
                    
                    resultsHTML += `
                        <div class="list-group-item list-group-item-action">
                            <div class="d-flex w-100 justify-content-between">
                                <h5 class="mb-1">${car.model} (${car.type})</h5>
                                <strong>₹${car.pricePerDay}/day</strong>
                            </div>
                            <div class="d-flex justify-content-between">
                                <div>
                                    <p class="mb-1">${car.seats} Seats | ${car.transmission} | Total: ₹${totalPrice}</p>
                                    <small>Unlimited kilometers | Free cancellation</small>
                                </div>
                                <div>
                                    <button class="btn btn-sm btn-outline-primary select-rental">Book Now</button>
                                </div>
                            </div>
                        </div>
                    `;
                });
                
                resultsHTML += `</div>`;
            }
            
            resultsContainer.innerHTML = resultsHTML;
            
            // Add event listeners to select buttons
            const selectButtons = document.querySelectorAll('.select-rental');
            selectButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const rentalItem = this.closest('.list-group-item');
                    
                    // Remove active class from all items
                    document.querySelectorAll('.list-group-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    
                    // Add active class to selected item
                    rentalItem.classList.add('active');
                    
                    // Show a confirmation message
                    const carName = rentalItem.querySelector('h5').textContent;
                    alert(`You've selected ${carName}. This is a demo - booking would be completed here.`);
                });
            });
        }
    }
});