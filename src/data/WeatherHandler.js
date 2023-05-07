class WeatherHandler {
  #WEATHER_API;
  #currentLocationData;

  constructor({ WEATHER_API }) {
    this.#WEATHER_API = WEATHER_API;
  }

  setLocationData(locationData) {
    this.#currentLocationData = locationData;
  }

  _getRequest(params = null) {
    const weatherUrl = new URL(this.#WEATHER_API);

    weatherUrl.searchParams.append(
      "latitude",
      this.#currentLocationData["latitude"]
    );
    weatherUrl.searchParams.append(
      "longitude",
      this.#currentLocationData["longitude"]
    );

    for (let key in params) weatherUrl.searchParams.append(key, params[key]);
    return fetch(weatherUrl);
  }

  getCurrentWeather() {
    const currentParams = {
      hourly:
        "temperature_2m,windspeed_10m,winddirection_10m,relativehumidity_2m,precipitation_probability,is_day",
      windspeed_unit: "kmh",
      forecast_days: "1",
      daily: "sunrise,sunset,temperature_2m_max",
      timezone: this.#currentLocationData["timezone"],
    };
    return this._getRequest(currentParams);
  }
  getCurrentSunlight() {
    // 7 days weather
    const currentParams = {
      daily: "sunrise,sunset,temperature_2m_max",
      timezone: this.#currentLocationData["timezone"],
    };
    return this._getRequest(currentParams);
  }
  getWeatherForecast(days = 10) {
    if (1 < days < 16) {
      const currentParams = {
        daily:
          "sunrise, sunset, temperature_2m_max, precipitation_sum, rain_sum,precipitation_probability_max, windspeed_10m_max,winddirection_10m_dominant",
        windspeed_unit: "ms",
        forecast: days,
        timezone: this.#currentLocationData["timezone"],
      };
      return this._getRequest(currentParams);
    } else {
      throw new console.error("Wrong time zone selection.");
      return undefined;
    }
  }
}
