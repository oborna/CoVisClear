// Setting coordinates: .setView([Latitude, Longitude])
// Sample here is Corvallis, can be changed

var mymap = L.map('results-map', {zoomControl:false}).setView([44.5646, -123.26], 13);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: MAPBOX_KEY
}).addTo(mymap);

// Add circle marker
var circle = L.circle([44.5646, -123.26], {
    color: '#F17A7A',
    fillColor: '#F17A7A',
    fillOpacity: 0.3,
    radius: 1000
}).addTo(mymap);

