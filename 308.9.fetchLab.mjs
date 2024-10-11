import * as Carousel from "./Carousel.mjs";
// import axios from "axios";

// The breed selection input element.
const breedSelect = document.getElementById("breedSelect");
// The information section div element.
const infoDump = document.getElementById("infoDump");
// The progress bar div element.
const progressBar = document.getElementById("progressBar");
// The get favourites button element.
const getFavouritesBtn = document.getElementById("getFavouritesBtn");

// Step 0: Store your API key here for reference and easy access.
const API_KEY =
  "live_t9bZ5oU9OURpAYkFPTSFSnmVybNgNJJjNPms0aMPsKeTIKGYlAm8zBm9JadNSMk6";

axios.defaults.baseURL = "https://api.thecatapi.com/v1";
axios.defaults.headers.common["x-api-key"] = API_KEY;
/**
 * 1. Create an async function "initialLoad" that does the following:
 * - Retrieve a list of breeds from the cat API using fetch().
 * - Create new <options> for each of these breeds, and append them to breedSelect.

 * This function should execute immediately.
 */

(async function initialLoad() {
  try {
    const response = await axios.get("/breeds");
    response.data.forEach((breed) => {
      let option = document.createElement("option");
      option.value= breed.id;
      option.text = breed.name;
      breedSelect.appendChild(option);
    });
    handleBreedSelectChange();
  } catch (error) {
    console.log(error, "error loading breed names");
  }
})();

/**
 * 2. Create an event handler for breedSelect that does the following:
 * - Retrieve information on the selected breed from the cat API using fetch().
 * - Each new selection should clear, re-populate, and restart the Carousel.
 * - Add a call to this function to the end of your initialLoad function above to create the initial carousel.
 */
async function handleBreedSelectChange(event) {
  try {
    const breedSelected = breedSelect.value;
    const response = await axios.get(
      `/images/search?breed_ids=${breedSelected}&limit=10`,
      { onDownloadProgress: updateProgress }
    );
    let catData = response.data;
    // console.log(response.data);
    Carousel.clear();
    infoDump.innerHTML = "";

    catData.forEach((cat) => {
      const createCat = Carousel.createCarouselItem(
        cat.url,
        breedSelected,
        cat.id
      );
      Carousel.appendCarousel(createCat);
    });
    // Display supplemental information
    const breedData = {
      Name: catData[0].breeds[0].name,
      Origin: catData[0].breeds[0].origin,
      Description: catData[0].breeds[0].description,
    };
    const characteristics = {
      Adaptability: catData[0].breeds[0].adaptability,
      Affection_Level: catData[0].breeds[0].affection_level,
      Child_Friendly: catData[0].breeds[0].child_friendly,
      Dog_Friendly: catData[0].breeds[0].dog_friendly,
      Energy_Level: catData[0].breeds[0].energy_level,
      Intelligence: catData[0].breeds[0].intelligence,
      Shedding_Level: catData[0].breeds[0].shedding_level,
      Social_Needs: catData[0].breeds[0].social_needs,
      Strain_Unknown: catData[0].breeds[0].stranger_friendly,
      Vocal_Rating: catData[0].breeds[0].vocalisation,
    };
    // console.log(characteristics)
    const fragment = document.createDocumentFragment();
    const breedInfo = document.createElement("div");
    breedInfo.className = "breed-info";

    for (const key in breedData) {
      const breedProperty = document.createElement("div");
      breedProperty.className = "breed-property";

      const propertyName = document.createElement("h3");
      propertyName.textContent = key;

      const propertyValue = document.createElement("p");
      propertyValue.textContent = breedData[key];

      breedProperty.appendChild(propertyName);
      breedProperty.appendChild(propertyValue);
      breedInfo.appendChild(breedProperty);
    }

    for (const key in characteristics) {
      const breedProperty = document.createElement("div");
      breedProperty.className = "breed-property";

      const propertyName = document.createElement("h6");
      propertyName.textContent = key;

      const propertyValue = document.createElement("p");
      propertyValue.textContent = characteristics[key];

      breedProperty.appendChild(propertyName);
      breedProperty.appendChild(propertyValue);
      breedInfo.appendChild(breedProperty);
    }

    fragment.appendChild(breedInfo);
    infoDump.appendChild(fragment);
  } catch (error) {
    console.error(error, "error loading cat info");
  }
}
breedSelect.addEventListener("change", handleBreedSelectChange);

//* 5. Add axios interceptors to log the time between request and response to the console.
axios.interceptors.request.use((request) => {
  progressBar.style.width = "0%";
  document.body.style.cursor = "progress";
  request.metadata = request.metadata || {};
  request.metadata.startTime = new Date().getTime();
  return request;
});

axios.interceptors.response.use(
  (response) => {
    
    response.config.metadata.endTime = new Date.now();
    response.config.metadata.durationInMS =
    response.config.metadata.endTime - response.config.metadata.startTime;
    
    console.log(
      `Request took ${response.config.metadata.durationInMS} milliseconds.`
    );
    document.body.style.cursor = "default";
    return response;
  },
  (error) => {
    error.config.metadata.endTime = new Date.now();
    error.config.metadata.durationInMS =
      error.config.metadata.endTime - error.config.metadata.startTime;

    console.log(
      `Error, Request took ${error.config.metadata.durationInMS} milliseconds.`
    );
    document.body.style.cursor = "default";

    throw error;
  }
);

/**
 * 6. Next, we'll create a progress bar to indicate the request is in progress.
 */
function updateProgress(event) {
  const percent = (event.loaded / event.total) * 100;
  progressBar.style.width = `${percent}%`;
}
/**
 * 7. As a final element of progress indication, add the following to your axios interceptors:
 * - In your request interceptor, set the body element's cursor style to "progress."
 * - In your response interceptor, remove the progress cursor style from the body element.
 */

/**
 * 8. To practice posting data, we'll create a system to "favourite" certain images.
 */

getFavouritesBtn.addEventListener("click", getFavourites);

async function getFavourites() {
  try {
    const favoritesData = await axios(`/favourites`,{ onDownloadProgress: updateProgress }
    );
    const favoritesImgObj = favoritesData.data.map((item) => item);
    console.log(favoritesImgObj)
    buildCarousel(favoritesImgObj)
    
  } catch (error) {
    console.error("Error getting favourites:", error);
  }
}

async function buildCarousel(catData) {
  Carousel.clear();
  infoDump.innerHTML = "";
catData.forEach((cat) => {
  const createCat = Carousel.createCarouselItem(
    cat.image.url,
    // Need to pass imgId parameter to createCarouselItem to delete favourite
    cat.id,
    cat.image.id
  );
  Carousel.appendCarousel(createCat);
});
}
// if the clicked image is already favourited, delete that favourite

export async function favourite(imgId) {
  try {
    const favouritesResponse = await axios.get("/favourites");
    // Check if image is already favourited
    const favouriteData = favouritesResponse.data.find(favourite => favourite.image_id === imgId);
    if (favouriteData) {
      await axios.delete(`/favourites/${favouriteData.id}`);
      getFavourites()
    } else {
      await axios.post(`/favourites`, { image_id: imgId });

    }
  } catch (error) {
    console.error(`Error favoriting  ${imgId}`, error);
  }
}
