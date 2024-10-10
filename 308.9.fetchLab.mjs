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
 *  - Each option should have a value attribute equal to the id of the breed.
 *  - Each option should display text equal to the name of the breed.
 * This function should execute immediately.
 */

(async function initialLoad() {
  try {
    const response = await axios.get("/breeds");
    response.data.forEach((breed) => {
      let option = document.createElement("option");
      option.setAttribute("value", breed.id);
      option.text = breed.name;
      breedSelect.appendChild(option);
    });
    handleBreedSelectChange();
  } catch (error) {
    console.log(error);
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
      {
        onDownloadProgress: (progressEvent) => {
          // Handle progress
        },
      }
    );
    console.log(response.data);
    let catData = response.data;
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

    const breedData = {
      Name: catData[0].breeds[0].name,
      Origin: catData[0].breeds[0].origin,
      Description: catData[0].breeds[0].description,
    };
    const characteristics= {
      Adaptability: catData[0].breeds[0].adaptability,
      Affection_Level: catData[0].breeds[0].affection_level,
      Child_Friendly: catData[0].breeds[0].child_friendly,
      Dog_Friendly: catData[0].breeds[0].dog_friendly,
      Energy_Level: catData[0].breeds[0].energy_level,
      Health_Rating: catData[0].breeds[0].health_rating,
      Intelligence: catData[0].breeds[0].intelligence,
      Shedding_Level: catData[0].breeds[0].shedding_level,
      Social_Needs: catData[0].breeds[0].social_needs,
      Strain_Unknown: catData[0].breeds[0].stranger_friendly,
      Vocal_Rating: catData[0].breeds[0].vocalisation,
    }
    console.log(characteristics)
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
    console.error(error);
  }
}
breedSelect.addEventListener("change", handleBreedSelectChange);

//* 5. Add axios interceptors to log the time between request and response to the console.
axios.interceptors.request.use((request) => {
  progressBar.style.width = "0%";
  document.body.style.setProperty("cursor", "progress");
  request.metadata = request.metadata || {};
  request.metadata.startTime = new Date().getTime();
  return request;
});

axios.interceptors.response.use(
  (response) => {
    response.config.metadata.endTime = new Date().getTime();
    response.config.metadata.durationInMS =
      response.config.metadata.endTime - response.config.metadata.startTime;

    console.log(
      `Request took ${response.config.metadata.durationInMS} milliseconds.`
    );
    document.body.style.cursor = "default";
    return response;
  },
  (error) => {
    error.config.metadata.endTime = new Date().getTime();
    error.config.metadata.durationInMS =
      error.config.metadata.endTime - error.config.metadata.startTime;

    console.log(
      `Request took ${error.config.metadata.durationInMS} milliseconds.`
    );
    document.body.style.cursor = "default";

    throw error;
  }
);

/**
 * 6. Next, we'll create a progress bar to indicate the request is in progress.
 * - The progressBar element has already been created for you.
 *  - You need only to modify its "width" style property to align with the request progress.
 *
 *
 * - In your request interceptor, set the width of the progressBar element to 0%.
 *  - This is to reset the progress with each request.
 * - Research the axios onDownloadProgress config option.
 * - Create a function "updateProgress" that receives a ProgressEvent object.
 *  - Pass this function to the axios onDownloadProgress config option in your event handler.
 * - console.log your ProgressEvent object within updateProgess, and familiarize yourself with its structure.
 *  - Update the progress of the request using the properties you are given.
 * - Note that we are not downloading a lot of data, so onDownloadProgress will likely only fire
 *   once or twice per request to this API. This is still a concept worth familiarizing yourself
 *   with for future projects.
 */
function updateProgress(progressEvent) {
  const total = progressEvent.total;
  const current = progressEvent.loaded;
  const percentage = Math.round((current / total) * 100);
  progressBar.style.transition = "width ease 1s";
  progressBar.style.width = percentage + "%";
}
/**
 * 7. As a final element of progress indication, add the following to your axios interceptors:
 * - In your request interceptor, set the body element's cursor style to "progress."
 * - In your response interceptor, remove the progress cursor style from the body element.
 */

/**
 * 8. To practice posting data, we'll create a system to "favourite" certain images.
 * - The skeleton of this function has already been created for you.
 * - This function is used within Carousel.js to add the event listener as items are created.
 *  - This is why we use the export keyword for this function.
 * - Post to the cat API's favourites endpoint with the given ID.
 * - The API documentation gives examples of this functionality using fetch(); use Axios!
 * - Add additional logic to this function such that if the image is already favourited,
 *   you delete that favourite using the API, giving this function "toggle" functionality.
 * - You can call this function by clicking on the heart at the top right of any image.
 */
export async function favourite(imgId) {
  // your code here
}

/**
 * 9. Test your favourite() function by creating a getFavourites() function.
 * - Use Axios to get all of your favourites from the cat API.
 * - Clear the carousel and display your favourites when the button is clicked.
 *  - You will have to bind this event listener to getFavouritesBtn yourself.
 *  - Hint: you already have all of the logic built for building a carousel.
 *    If that isn't in its own function, maybe it should be so you don't have to
 *    repeat yourself in this section.
 */

/**
 * 10. Test your site, thoroughly!
 * - What happens when you try to load the Malayan breed?
 *  - If this is working, good job! If not, look for the reason why and fix it!
 * - Test other breeds as well. Not every breed has the same data available, so
 *   your code should account for this.
 */
