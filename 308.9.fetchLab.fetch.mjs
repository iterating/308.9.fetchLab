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

/**
 * 1. Create an async function "initialLoad" that does the following:
 * - Retrieve a list of breeds from the cat API using fetch().
 * - Create new <options> for each of these breeds, and append them to breedSelect.
 */
async function initialLoad() {
  try {
    const response = await fetch("https://api.thecatapi.com/v1/breeds", {
      headers: {
        "x-api-key": API_KEY,
      },
    });
    if (!response.ok) {
      throw new Error("Error fetching breeds");
    }
    const data = await response.json();
    data.forEach((breed) => {
      let option = document.createElement("option");
      option.value = breed.id;
      option.text = breed.name;
      breedSelect.appendChild(option);
    });
    handleBreedSelectChange();
  } catch (error) {
    console.error("Error loading breed names:", error);
  }
}

/**
 * 2. Create an event handler for breedSelect that does the following:
 * - Retrieve information on the selected breed from the cat API using fetch().
 * - Each new selection should clear, re-populate, and restart the Carousel.
 * - Add a call to this function to the end of your initialLoad function above to create the initial carousel.
 */
async function handleBreedSelectChange(event) {
  try {
    const breedSelected = breedSelect.value;
    const response = await fetch(
      `https://api.thecatapi.com/v1/images/search?breed_ids=${breedSelected}&limit=10`,
      {
        headers: {
          "x-api-key": API_KEY,
        },
        onDownloadProgress: updateProgress,
      }
    );
    if (!response.ok) {
      throw new Error("Error fetching cat info");
    }
    const data = await response.json();
    if (!data) {
      throw new Error("No data returned from API");
    }

    Carousel.clear();
    infoDump.innerHTML = "";

    data.forEach((cat) => {
      const createCat = Carousel.createCarouselItem(
        cat.url,
        breedSelected,
        cat.id
      );
      Carousel.appendCarousel(createCat);
    });
    // Display supplemental information
    const breedData = {
      Name: data[0].breeds[0].name,
      Origin: data[0].breeds[0].origin,
      Description: data[0].breeds[0].description,
    };
    const characteristics = {
      Adaptability: data[0].breeds[0].adaptability,
      Affection_Level: data[0].breeds[0].affection_level,
      Child_Friendly: data[0].breeds[0].child_friendly,
      Dog_Friendly: data[0].breeds[0].dog_friendly,
      Energy_Level: data[0].breeds[0].energy_level,
      Intelligence: data[0].breeds[0].intelligence,
      Shedding_Level: data[0].breeds[0].shedding_level,
      Social_Needs: data[0].breeds[0].social_needs,
      Strain_Unknown: data[0].breeds[0].stranger_friendly,
      Vocal_Rating: data[0].breeds[0].vocalisation,
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
    infoDump.style = `
    background-color: #f7f7f7;
    max-width: 500px;
    padding: 20px;
    margin: 20px auto;
    border: 1px solid #ddd;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  `;
  } catch (error) {
    console.error("Error loading cat info:", error);
  }
}

async function logFetchTime(url, options) {
  const startTime = new Date().getTime();
  const response = await fetch(url, options);
  const endTime = new Date().getTime();
  const durationInMS = endTime - startTime;
  console.log(`Request took ${durationInMS} milliseconds.`);
  return response;
}

getFavouritesBtn.addEventListener("click", getFavourites);

async function getFavourites() {
  try {
    const favoritesData = await logFetchTime(
      "https://api.thecatapi.com/v1/favourites",
      {
        headers: {
          "x-api-key": API_KEY,
        },
      }
    );
    const favoritesImgObj = favoritesData.data.map((item) => item);
    buildCarousel(favoritesImgObj);
  } catch (error) {
    console.error("Error getting favourites:", error);
  }
}

async function buildCarousel(catData) {
  try {
    if (!catData) {
      throw new Error("favourites data is null or undefined");
    }
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
  } catch (error) {
    console.error("Error building carousel:", error);
  }
}

/**
 * 8. To practice posting data, we'll create a system to "favourite" certain images.
 */
export async function favourite(imgId) {
  try {
    const isFavorite = await logFetchTime(
      `https://api.thecatapi.com/v1/favourites?image_id=${imgId}`,
      {
        headers: {
          "x-api-key": API_KEY,
        },
      }
    );
    const data = await isFavorite.json();
    if (data[0]) {
      await logFetchTime(
        `https://api.thecatapi.com/v1/favourites/${data[0].id}`,
        {
          method: "DELETE",
          headers: {
            "x-api-key": API_KEY,
          },
        }
      );
      getFavourites();
    } else {
      await logFetchTime("https://api.thecatapi.com/v1/favourites", {
        method: "POST",
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image_id: imgId }),
      });
    }
  } catch (error) {
    console.error(`Error favoriting ${imgId}`, error);
  }
}

