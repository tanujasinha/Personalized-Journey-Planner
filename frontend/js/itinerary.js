const weatherContainer = document.querySelector('.weather-placeholder');
const tripData = JSON.parse(sessionStorage.getItem('tripData'));
console.log("Trip Data:", tripData);
document.addEventListener('DOMContentLoaded', async function () {

    // Get trip data from session storage

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


    if (!tripData) {
        window.location.href = 'trip-planner.html';
    }

    try {
        // Fetch and display weather using latitude and longitude
        if (tripData.latitude && tripData.longitude) {
            fetchWeather(tripData.latitude, tripData.longitude, tripData.destination);
        } else {
            weatherContainer.innerHTML = '<p>Weather data not available</p>';
        }
    } catch (error) {
        console.error('Error:', error);

    }
});