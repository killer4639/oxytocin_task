import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
var options = {
  method: "POST",
  url: "https://travel-advisor.p.rapidapi.com/restaurant-filters/v2/list",
  params: { currency: "USD", units: "km", lang: "en_US" },
  headers: {
    "content-type": "application/json",
    "x-rapidapi-host": "travel-advisor.p.rapidapi.com",
    "x-rapidapi-key": process.env.xRapidKey,
  },
  data: {
    geoId: 293928,
    partySize: 2,
    reservationTime: "2021-07-07T20:00",
    sort: "RELEVANCE",
    sortOrder: "asc",
    filters: [],
  },
};
let finalfilters = {};
await axios
  .request(options)
  .then(function (response) {
    // console.log(response.data);

    let filters = {};
    for (let ele of response.data.data.AppPresentation_queryAppListV2[0].filters
      .availableFilterGroups[0].filters) {
      let filterMap = {};
      for (let it of ele.values) {
        if (ele.name === "openNow") {
          filterMap["true"] = it.value;
        } else if (ele.name === "price") {
          if (it.object.text.length >= 5) {
            filterMap[2] = it.value;
            filterMap[3] = it.value;
          } else {
            filterMap[it.object.text.length] = it.value;
          }
        } else if (ele.name === "minRating") {
          filterMap[it.object.minimumRatingValue] = it.value;
        } else {
          let data = it.object.tag;
          let tag = data.localizedName,
            tagId = data.tagId;
          filterMap[tag.toLowerCase()] = tagId;
        }
      }
      filters[ele.name] = filterMap;
    }
    finalfilters = filters;
    // console.log(filters);
    // return filters;
  })
  .catch(function (error) {
    console.error(error);
  });
export default finalfilters;
