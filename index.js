const LOCATION_API = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_API = "https://api.open-meteo.com/v1/forecast";
const AIR_QUALITY_API = "https://air-quality-api.open-meteo.com/v1/air-quality";

const locationHandler = new LocationHandler({
  LOCATION_API: LOCATION_API,
  targetElementSelector: "#location_results",
  listElementSelector: "location_search_results",
});

const weatherHandler = new WeatherHandler({
  WEATHER_API: WEATHER_API,
});
const airQualityHandler = new AirQualityHandler({
  AIR_QUALITY_API: AIR_QUALITY_API,
});

const location_input = document.querySelector("#input_location");
const aqi_indicator = document.getElementsByName("aqi_small_indicator");
let currentAIQ = "";

location_input.addEventListener(
  "input",
  debounce(async (e) => {
    let query = e.target.value;
    document.querySelector("#location_results").innerHTML = "";
    if (query.length)
      await locationHandler.getLocations(query, onClickListener, 5);
    else document.querySelector("#location_results").innerHTML = "";
  }, 500)
);

const onClickListener = (e, loc) => {
  location_input.value = `${loc.name}, ${loc.country}`;
  document.querySelector("#location_results").innerHTML = "";
  document.getElementsByName(
    "current_location"
  )[0].innerHTML = `${loc.name}, ${loc.country}`;
  setCurrentWeatherData(loc);
};

async function setCurrentWeatherData(loc) {
  weatherHandler.setLocationData(loc);
  airQualityHandler.setLocationData(loc);

  const currentAirData = await (
    await airQualityHandler.getCurrentAirQuality()
  ).json();

  const currentData = await (await weatherHandler.getCurrentWeather()).json();
  const hourlyIndex = getHourlyIndex(currentData);

  const hourly = currentData.hourly;
  const daily = currentData.daily;
  const hourlyUnits = currentData.hourly_units;

  const currTemp = document.getElementsByName("currTemp");
  const avg_temp = document.getElementsByName("avg_temp");
  const max_min_temp = document.getElementsByName("max_min_temp");
  const sunrise = document.getElementsByName("sunrise");
  const sunset = document.getElementsByName("sunset");
  const windspeed = document.getElementsByName("windspeed");
  const humidity = document.getElementsByName("humidity");

  if (hourlyIndex != 1) {
    currentAIQ = currentAirData.hourly.pm2_5[hourlyIndex];

    currTemp[0].innerHTML = hourly.temperature_2m[hourlyIndex];
    windspeed[0].innerHTML =
      hourly.windspeed_10m[hourlyIndex] + " " + hourlyUnits["windspeed_10m"];
    humidity[0].innerHTML =
      hourly.relativehumidity_2m[hourlyIndex].toString() +
      " " +
      hourlyUnits["relativehumidity_2m"].toString();

    max_min_temp[0].innerHTML = get_max_min_temp(hourly.temperature_2m);
    sunrise[0].innerHTML = daily.sunrise[0].slice(11, 16);
    sunset[0].innerHTML = daily.sunset[0].slice(11, 16);
    avg_temp[0].innerHTML =
      daily.temperature_2m_max[0].toString() +
      hourlyUnits.temperature_2m.toString();
    aqi_indicator[0].innerHTML = currentAIQ;
  } else throw new console.error("Something went wrong!");
}

function getSunglightData(sunlightData) {
  const nowUTC = new Date();
  const current_date = nowUTC.toISOString().slice(0, 10);
  const index = sunlightData.daily.time.indexOf(current_date);
  return index;
}

function getHourlyIndex(current_date) {
  const now = new Date();
  const roundedHour = new Date(
    Math.ceil(now.getTime() / (60 * 60 * 1000)) * (60 * 60 * 1000)
  );

  let index = -1;
  current_date.hourly?.time.some((time, i) => {
    if (new Date(time) >= roundedHour) {
      index = i;
      return true;
    }
  });
  return index;
}

function get_max_min_temp(temp) {
  let max = temp.reduce((a, b) => (a > b ? a : b));
  let min = temp.reduce((a, b) => (a < b ? a : b));
  return `${max}°/${min}°`;
}

function debounce(func, delay) {
  let timeout;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    return setTimeout(() => func.apply(context, args), delay);
  };
}
aqi_indicator[0].addEventListener("onmouseover", (e) => {
  e.preventDefault();
  handleAiq(currentAIQ, aqi_indicator[0]);
});

aqi_indicator[0].addEventListener("onmouseout", () => {
  aqi_indicator[0].innerHTML = aiq;
});

function handleAiq(aiq, selector) {
  console.log(
    airQualityHandler.checkAirQuality(aiq),
    airQualityHandler.checkAirQualityIndicator(aiq)
  );
  const quality = airQualityHandler.checkAirQuality(aiq);
  const indicator = airQualityHandler.checkAirQualityIndicator(aiq);
  selector.innerHTML = quality;

  const OpacityColor = (hex, alpha) =>
    `${hex}${Math.floor(alpha * 255)
      .toString(16)
      .padStart(2, 0)}`;
  selector.parentNode.style.backgroundColor = OpacityColor(indicator, 0.8);
}
