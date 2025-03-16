// js/trip-planner.js

let latitude,longitude;
document.addEventListener('DOMContentLoaded', async function () {
    const destinationInput = document.getElementById('destination');

    // Create alet latitude  dropdown list element
    let suggestionList = document.createElement('ul');
    suggestionList.id = 'autocomplete-list';
    suggestionList.style.position = 'absolute';
    suggestionList.style.background = '#fff';
    suggestionList.style.border = '1px solid #ddd';
    suggestionList.style.listStyle = 'none';
    suggestionList.style.padding = '0';
    suggestionList.style.width = destinationInput.offsetWidth + 'px';
    suggestionList.style.maxHeight = '200px';
    suggestionList.style.overflowY = 'auto';
    suggestionList.style.zIndex = '1000';
    document.body.appendChild(suggestionList);

    destinationInput.addEventListener('input', async function () {
        let query = destinationInput.value;
        if (query.length < 3) {
            suggestionList.innerHTML = ''; // Clear suggestions if query is too short
            return;
        }

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5`);
            const results = await response.json();
console.log(results);
            suggestionList.innerHTML = ''; // Clear previous results

            if (results.length === 0) {
                let listItem = document.createElement('li');
                listItem.textContent = 'No results found';
                listItem.style.padding = '8px';
                listItem.style.color = 'gray';
                suggestionList.appendChild(listItem);
            } else {
                results.forEach(place => {
                    let listItem = document.createElement('li');
                    listItem.textContent = place.display_name; // Correctly fetch place name
                    listItem.style.padding = '8px';
                    listItem.style.cursor = 'pointer';
                    listItem.style.borderBottom = '1px solid #ddd';
                    listItem.style.color = 'black';

                    listItem.addEventListener('click', function () {
                        destinationInput.value = place.display_name;
                        latitude = place.lat;
                        longitude = place.lon;
                        console.log("Latitude :",latitude,"Longitude :", longitude);
                        suggestionList.innerHTML = ''; // Clear dropdown on selection
                    });

                    suggestionList.appendChild(listItem);
                });
            }

            // Position dropdown below input field
            let rect = destinationInput.getBoundingClientRect();
            suggestionList.style.left = rect.left + 'px';
            suggestionList.style.top = (rect.bottom + window.scrollY) + 'px';

        } catch (error) {
            console.error('Autocomplete error:', error);
        }
    });

    // Hide suggestions when clicking outside
    document.addEventListener('click', function (event) {
        if (!destinationInput.contains(event.target)) {
            suggestionList.innerHTML = ''; // Hide dropdown when clicking outside
        }
    });
});


// Ensure the form submission logic remains the same
    const tripForm = document.getElementById('trip-form');
    if (tripForm) {
        tripForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const destination = document.getElementById('destination').value;
            const days = document.getElementById('days').value;
            const budget = document.getElementById('budget').value;
            const interests = {
                adventure: document.getElementById('adventure').checked,
                history: document.getElementById('history').checked,
                food: document.getElementById('food').checked,
                nature: document.getElementById('nature').checked
            };

            sessionStorage.setItem('tripData', JSON.stringify({
                destination,
                latitude,
                longitude,
                days,
                budget,
                interests
            }));
            window.location.href = 'itinerary.html';
           
        });
    }
