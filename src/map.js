import L from "leaflet";
//override the default
class CustomTileLayer extends L.TileLayer {
  getTileUrl(coords) {
    const Zcoord = 2 ** (8 - coords.z);
    const Xcoord = coords.x * 1;
    const Ycoord = coords.y * -1;
    const group = {
      x: Math.floor((Xcoord * Zcoord) / 32),
      y: Math.floor((Ycoord * Zcoord) / 32),
    };
    const numberInGroup = {
      x: Math.floor(Xcoord * Zcoord),
      y: Math.floor(Ycoord * Zcoord),
    };
    let zzz = "";
    for (let i = 8; i > coords.z; i--) {
      zzz += "z";
    }
    if (zzz.length != 0) zzz += "_";
    const url = `http://142.4.216.95:8192/tiles/Tashret/flat/${group.x}_${group.y}/${zzz}${numberInGroup.x}_${numberInGroup.y}.jpg`;
    return url;
  }
}
// static factory as recommended by http://leafletjs.com/reference-1.0.3.html#class
const customTileLayer = function (templateUrl, options) {
  return new CustomTileLayer(templateUrl, options);
};
export function initMap() {
  const map = L.map("map", {
    crs: L.CRS.Simple,
    preferCanvas: true,
  }).setView([0, 0], 8);
  customTileLayer("unused url; check custom function", {
    maxZoom: 8,
    // zoomControl: false, //there's also css to do this bc this line doesn't work
    id: "map",
    tileSize: 128,
    zoomOffset: 0,
    noWrap: true,
    bounds: [
      [-900, -900],
      [900, 900],
    ],
    attribution: "UniTerra",
  }).addTo(map);
  L.control
    .zoom({
      position: "topright",
    })
    .addTo(map);
  return map;
}
