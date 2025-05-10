import $ from "jquery";
import L from "leaflet";
import { mapcoord } from "../utils/coord";
import { CityMap, g, gb, gcm } from "./globals";
export async function initMapCities() {
  const res = await fetch(
    "https://script.google.com/macros/s/AKfycbwde4vwt0l4_-qOFK_gL2KbVAdy7iag3BID8NWu2DQ1566kJlqyAS1Y/exec?spreadsheetId=1JSmJtYkYrEx6Am5drhSet17qwJzOKDI7tE7FxPx4YNI&sheetName=New%20World",
  );
  const towns = await res.json();
  mapTowns(towns);
  mapLayers();
  gb().city.enable();
  gb().airportCalc.enable();
  $("#search__input").removeAttr("disabled");
}
//when we zoom the map
//remove cities when we zoom out
//add them when we zoom in
export function mapLayers() {
  const { cityLayers, CC, searchLayer } = gcm();
  const map = g().map;
  if (!g().displayTowns) {
    map.removeLayer(cityLayers.get("Megacity"));
    map.removeLayer(cityLayers.get("Metropolis"));
    map.removeLayer(cityLayers.get("Large City"));
    map.removeLayer(cityLayers.get("City"));
    map.removeLayer(cityLayers.get("Town"));
    map.removeLayer(cityLayers.get("Village"));
    map.removeLayer(cityLayers.get("Locality"));
    map.removeLayer(CC);
    return;
  } else {
    map.removeLayer(searchLayer);
    console.log(cityLayers.entries());
    map.addLayer(cityLayers.get("Megacity"));
    map.addLayer(cityLayers.get("Metropolis"));
    map.addLayer(cityLayers.get("Large City"));
    map.addLayer(cityLayers.get("City"));
    map.addLayer(cityLayers.get("Town"));
    map.addLayer(cityLayers.get("Village"));
    map.addLayer(cityLayers.get("Locality"));
    map.addLayer(CC);
  }
  // This made stuff hard to use
  /*
      map.removeLayer(searchLayer);
      map.addLayer(CC);
      if (map.getZoom() >= 1) {
          map.addLayer(cityLayers.Premier);
      } else {
          map.removeLayer(cityLayers.Premier);
      }
  
      if (map.getZoom() >= 2) {
          map.addLayer(cityLayers.Governor);
          map.addLayer(cityLayers.Senator);
          map.addLayer(cityLayers.Community);
      } else {
          map.removeLayer(cityLayers.Governor);
          map.removeLayer(cityLayers.Senator);
          map.removeLayer(cityLayers.Community);
      }
  
      if (map.getZoom() >= 3) {
          map.addLayer(cityLayers.Councillor);
          map.addLayer(cityLayers.Mayor);
      } else {
          map.removeLayer(cityLayers.Councillor);
          map.removeLayer(cityLayers.Mayor);
      }
  
      if (map.getZoom() >= 4) {
          map.addLayer(cityLayers.Unranked);
      } else {
          map.removeLayer(cityLayers.Unranked);
      }*/
}
function mapTowns(towns) {
  const rankColors = {
    Megacity: "#fffc04",
    Metropolis: "#08fc04",
    Large_City: "#08ac04",
    City: "#0804fc",
    Town: "#5084ec",
    Village: "#781c44",
    Locality: "#ffffff",
  };
  gcm().towns = towns;
  const { cityMarkers, cityLayers } = gcm();
  for (const town of towns) {
    town.Name = town["Town Name"];
    //parse Coords
    const rawCoords = [town.X, town.Y, town.Z];
    //do not map if invalid coords
    if (isNaN(rawCoords[0]) || isNaN(rawCoords[2])) {
      console.warn(
        `Not displaying town ${town.Name}: invalid or missing coordinates`,
      );
    } else {
      const coords = mapcoord([rawCoords[0], rawCoords[2]]);
      //if town rank array in object is undefined define it
      if (!cityMarkers.has(town["Town Rank"])) {
        cityMarkers.set(town["Town Rank"], []);
      }
      //create marker and add it to array
      cityMarkers.get(town["Town Rank"]).push(
        L.circleMarker(coords, {
          color: rankColors[town["Town Rank"]],
          radius: 7,
        }).bindPopup(
          `Name: ${town.Name}<br>Mayor: ${town.Mayor}<br>Deputy Mayor: ${town["Deputy Mayor"]}<br>Rank: ${town["Town Rank"]}<br>`,
        ),
      );
    }
  }
  //for each type of city
  CityMap.cityTypes.forEach((type) => {
    //create a new feature group
    const featureGroup = L.featureGroup();
    //and add all cities of type
    cityMarkers.get(type).forEach((city) => {
      featureGroup.addLayer(city);
    });
    cityLayers.set(type, featureGroup);
  });
  g().map.on("zoomend", mapLayers);
}
