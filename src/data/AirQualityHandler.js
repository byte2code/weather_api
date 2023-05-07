class AirQualityHandler {
  #AIR_QUALITY_API;
  #currentLocationData;

  constructor({ AIR_QUALITY_API }) {
    this.#AIR_QUALITY_API = AIR_QUALITY_API;
  }

  setLocationData(locationData) {
    this.#currentLocationData = locationData;
  }

  // "0-10": "Good",
  // "10-20": "Fair",
  // "20-25": "Moderate",
  // "25-50": "Poor",
  // "50-75": "Very Poor",
  // "75-800": "Extremely Poor"

  airQuality = {
    start: [0, 10, 20, 25, 50, 75],
    end: [10, 20, 25, 50, 75, 800],
    quality: [
      "Good",
      "Fair",
      "Moderate",
      "Poor",
      "Very Poor",
      "Extremely Poor",
    ],
    color_indicator: [
      "#50f0e6",
      "#50ccaa",
      "#f0e641",
      "#ff5050",
      "#960032",
      "#7d2181",
    ],
  };

  //   hourly=pm2_5&start_date=2023-05-07&end_date=2023-05-07
  _fetchAirQualityData(params = null) {
    const airQualityApi = new URL(this.#AIR_QUALITY_API);
    airQualityApi.searchParams.append(
      "latitude",
      this.#currentLocationData.latitude
    );
    airQualityApi.searchParams.append(
      "longitude",
      this.#currentLocationData.longitude
    );
    airQualityApi.searchParams.append("hourly", "pm2_5");
    for (let key in params) airQualityApi.searchParams.append(key, params[key]);

    return fetch(airQualityApi);
  }

  getCurrentAirQuality() {
    const now = new Date().toISOString().split("T")[0];
    const currentParams = {
      start_date: now,
      end_date: now,
    };
    return this._fetchAirQualityData(currentParams);
  }

  checkAirQuality(aiq) {
    let result = this.airQuality.quality.find((q, id) => {
      return aiq <= this.airQuality.end[id];
    });
    return result ? result : "Evacuate";
  }

  checkAirQualityIndicator(aiq) {
    let result = this.airQuality.color_indicator.find((q, id) => {
      return aiq <= this.airQuality.end[id];
    });
    return result ? result : color_indicator[color_indicator.length - 1];
  }
}
