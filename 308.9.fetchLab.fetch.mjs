/**
 * 1. Create an async function "initialLoad" that does the following:
 * - Retrieve a list of breeds from the cat API using fetch().
 * - Create new <options> for each of these breeds, and append them to breedSelect.

 * This function should execute immediately.
 */
import * as Carousel from "./Carousel.mjs";

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

(async function initialLoad() {
    try {
      const response = await fetch("/breeds");
      if (!response.ok) {
        throw new Error(`Error loading breed names: ${response.status}`);
      }
      const data = await response.json();
      data.forEach((breed) => {
        const option = document.createElement("option");
        option.value = breed.id;
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
      const response = await fetch(
        `/images/search?breed_ids=${breedSelected}&limit=10`,
        { method: "GET", onprogress: updateProgress }
      );
      if (!response.ok) {
        throw new Error(`Error loading images: ${response.status}`);
      }
      const data = await response.json();
      // console.log(response.data);
      Carousel.clear();
      infoDump.innerHTML = "";
  
      data.forEach((cat) => {
        const createCat = Carousel.createCarouselItem(
          cat.url,
          cat.id,
          cat.breed
        );
        Carousel.appendCarousel(createCat);
      });
    } catch (error) {
      console.error("Error loading images:", error);
    }
  }

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

    const propertyValue = document.createElement("p")
    
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
  console.error(error, "error loading cat info");
}
}
breedSelect.addEventListener("change", handleBreedSelectChange);


getFavouritesBtn.addEventListener("click", getFavourites);

async function getFavourites() {
  try {
    const response = await fetch("/favourites", {
      onprogress: updateProgress
    });
    if (!response.ok) {
      throw new Error(`Error getting favourites: ${response.status}`);
    }
    const favoritesData = await response.json();
    const favoritesImgObj = favoritesData.map((item) => item);
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
        cat.id,
        cat.image.id
      );
      Carousel.appendCarousel(createCat);
    });
  } catch (error) {
    console.error("Error building carousel:", error);
  }
}

export async function favourite(imgId) {
  try {
    const response = await fetch(`/favourites?image_id=${imgId}`);
    if (!response.ok) {
      throw new Error(`Error checking favourite: ${response.status}`);
    }
    const isFavorite = await response.json();
    if (isFavorite[0]) {
      await fetch(`/favourites/${isFavorite[0].id}`, {
        method: "DELETE"
      });
      getFavourites();
    } else {
      await fetch("/favourites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ image_id: imgId })
      });
    }
  } catch (error) {
    console.error(`Error favoriting ${imgId}`, error);
  }
}