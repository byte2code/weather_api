class LocationHandler {
  #LOCATION_API;
  #targetElementSelector;
  #listElementSelector;
  constructor({ LOCATION_API, targetElementSelector, listElementSelector }) {
    this.#LOCATION_API = LOCATION_API;
    this.#targetElementSelector = targetElementSelector;
    this.#listElementSelector = listElementSelector;
  }

  async getLocations(query, onClickListener, maxResults = -1) {
    const parent = document.querySelector(this.#targetElementSelector);

    if (query) {
      const searchUrl = new URL(this.#LOCATION_API);
      searchUrl.searchParams.append("name", query);

      parent.innerHTML = "";

      const locations = await (await fetch(searchUrl)).json();
      if (locations.length < 0) parent.innerHTML = "<center>No Result";
      locations?.results
        ?.slice(0, maxResults > -1 ? maxResults : locations?.results?.length)
        .forEach((loc) => {
          let child = document.createElement("li");
          let geoData = document.createElement("span");

          child.classList.add(this.#listElementSelector);

          geoData.textContent = `${loc.country} (${loc.latitude?.toFixed(
            2
          )}°E ${loc.longitude.toFixed(2)}°N ${loc.elevation?.toFixed(0)}m) ${
            loc.timezone
          }`;

          let logo = this.getLocationLogo(loc.country_code);
          let logoImage = document.createElement("img");
          logoImage.style.width = 18 + "px";
          logoImage.style.height = 18 + "px";
          logoImage.setAttribute("src", logo);

          child.addEventListener("click", (e) => onClickListener(e, loc));
          geoData.addEventListener("click", (e) => onClickListener(e, loc));

          child.append(logoImage);
          child.innerHTML += loc.name;
          child.appendChild(geoData);
          parent.appendChild(child);
        });
    } else {
      parent.innerHTML = "No Search result";
    }
  }

  getLocationLogo(code) {
    const flagAPI = "https://open-meteo.com/images/country-flags";
    const flag_url = flagAPI + "/" + code.toLowerCase() + ".svg";
    // let data = await (await fetch(flag_url, { mode: "no-cors" })).text();
    return flag_url;
  }
}
