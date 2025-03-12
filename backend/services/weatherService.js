// backend/services/weatherService.js - OpenWeather API service
const axios = require('axios');

class WeatherService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
  }

  async getCurrentWeather(city) {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          q: city,
          appid: this.apiKey,
          units: 'metric'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching current weather:', error);
      throw error;
    }
  }

  async getForecast(city, days = 5) {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          q: city,
          appid: this.apiKey,
          units: 'metric',
          cnt: days * 8 // 8 data points per day (3 hour intervals)
        }
      });
      
      // Process forecast data to get daily forecasts
      const dailyData = this.processForecastData(response.data);
      return dailyData;
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      throw error;
    }
  }

  processForecastData(data) {
    const dailyForecasts = {};
    
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = {
          date,
          temperature: {
            min: item.main.temp_min,
            max: item.main.temp_max,
            avg: item.main.temp
          },
          condition: item.weather[0].main,
          description: item.weather[0].description,
          icon: item.weather[0].icon
        };
      } else {
        // Update min/max temperature
        dailyForecasts[date].temperature.min = Math.min(dailyForecasts[date].temperature.min, item.main.temp_min);
        dailyForecasts[date].temperature.max = Math.max(dailyForecasts[date].temperature.max, item.main.temp_max);
        // Update average
        dailyForecasts[date].temperature.avg = (dailyForecasts[date].temperature.avg + item.main.temp) / 2;
      }
    });
    
    return Object.values(dailyForecasts);
  }
}

module.exports = WeatherService;
