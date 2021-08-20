import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import filters from "./value_extraction.js";
dotenv.config();
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("working");
});

// function to convert the input field to values provided by the api

const extract_options = (optionsType, values) => {
  let options = "";
  try {
    for (let x of values) {
      if (optionsType === "price") {
        options += toString(filters[optionsType][x.length]);
      } else if (optionsType === "minRating") {
        options += toString(x);
      } else if (optionsType === "openNow") {
        options += filters[optionsType][x.toLowerCase()];
      } else {
        options += toString(filters[optionsType][x.toLowerCase()]);
      }
      options += ",";
    }
  } catch (e) {
    console.log(optionsType, values);
  }
  if (options.length > 0) {
    options = options.slice(0, -1);
  }

  return options;
};

app.post("/search", async (req, res) => {
  const {
    latitude,
    longitude,
    currency,
    distance,
    price,
    combined_food_list,
    dietary_restrictions,
    restaurant_tagcategory,
    restaurant_mealtype,
    restaurant_dining_options,
    open_now,
    min_rating,
  } = req.body;
  let options = {
    method: "GET",
    url: "https://travel-advisor.p.rapidapi.com/restaurants/list-by-latlng",
    params: {
      restaurant_dining_options: extract_options(
        "option",
        restaurant_dining_options
      ),
      restaurant_tagcategory: extract_options(
        "establishment",
        restaurant_tagcategory
      ),

      prices_restaurants: extract_options("price", price),
      dietary_restrictions: extract_options("diet", dietary_restrictions),
      restaurant_mealtype: extract_options("meal", restaurant_mealtype),

      combined_food: extract_options("cuisine", combined_food_list),
      open_now: extract_options("openNow", open_now),
      min_rating: extract_options("minRating", min_rating),
      latitude,
      longitude,
      limit: "10",
      currency,
      distance,
      open_now: "false",
      lunit: "km",
      lang: "en_US",
    },
    headers: {
      "x-rapidapi-host": "travel-advisor.p.rapidapi.com",
      "x-rapidapi-key": process.env.xRapidKey,
    },
  };

  axios
    .request(options)
    .then(function (response) {
      // console.log(response.data);
      let finalResponse = [];
      for (let restaurant of response.data.data) {
        finalResponse.push({
          latitude: restaurant.latitude,
          longitutde: restaurant.longitude,
          rating: restaurant.rating,
          name: restaurant.name,
          location: restaurant.location_string,
          description: restaurant.description,
          distance: restaurant.distance_string,
          price: restaurant.price,
        });
      }
      res.send(finalResponse);
    })
    .catch(function (error) {
      console.error(error);
      res.send("error");
    });
});
app.listen(3000, () => {
  console.log("listening on port 3000");
});
