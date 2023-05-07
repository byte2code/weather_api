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
      locations?.results
        ?.slice(0, maxResults > -1 ? maxResults : locations?.results?.length)
        .forEach((loc) => {
          let child = document.createElement("li");
          let geoData = document.createElement("span");

          child.classList.add(this.#listElementSelector);

          child.textContent = loc.name;
          geoData.textContent = `${loc.country} (${loc.latitude?.toFixed(
            2
          )}°E ${loc.longitude.toFixed(2)}°N ${loc.elevation?.toFixed(0)}m) ${
            loc.timezone
          }`;

          child.addEventListener("click", (e) => onClickListener(e, loc));
          geoData.addEventListener("click", (e) => onClickListener(e, loc));

          child.appendChild(geoData);

          parent.appendChild(child);
        });
    } else {
      parent.innerHTML = "";
    }
  }

  async getLocationLogo(code) {}
}
