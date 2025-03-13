//backend/utils/weather.js
const axios = require("axios");

const getWeatherForecast = async (lat, lon) => {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    try {
        const response = await axios.get(url);
        return {
            temperature: response.data.main.temp,
            condition: response.data.weather[0].description,
            icon: response.data.weather[0].icon
        };
    } catch (error) {
        console.error("Weather API Error:", error.response?.data || error.message);
        return null;
    }
};

module.exports = getWeatherForecast;
