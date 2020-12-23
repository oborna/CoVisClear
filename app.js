// Project: CoVisClear - BeaverHacks Fall 2020
// Team Name: Beaver With a Byte
// Contributors: Patricia Booth, Rohit Chaudhary, Anjanette Oborn, Timothy Yoon
// Description: Node.js server utilizing the Handlebars templating engine in order to handle location requests, route to approrpriate APIs to retrieve County location/COVID data, and mapping API in order to render results or failed searches to user.


var express = require('express');
var request = require('request');
var request_promise = require('request-promise');
var states = require('./public/states.json');
var api_keys = require('./api-keys.js');
// var api_keys = process.env.MAPQUEST_API_KEY;
var mapquest_base_url = 'http://open.mapquestapi.com/geocoding/v1/address';

require('dotenv').config();

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 7500);

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());

// validation and request functions that will be used by routes

// Validate the city/state input by checking data returned from the MapQuest API
function validateLocation(user_input, get_covid_data, res) {

    // Object to pass to the get_covid_data() callback
    let county_state_coords = {
        county: "",
        state: "",
        latitude: "",
        longitude: ""
    };

    // let raw_str = user_input.replace(/\s+/g, '');
    let comma_index = user_input.indexOf(',');
    let city_name = user_input.slice(0, comma_index);
    let state_name = user_input.slice(comma_index + 1, user_input.length).replace(/\s+/g, '');

    // Build the URL for the call to the API
    let mapquest_url = mapquest_base_url + `?key=${api_keys.mapquestKey}&location=${city_name},${state_name},US`;
    let options = {
        method: "GET",
        uri: mapquest_url
    };

    // Send GET request to the API
    request_promise(options)
        .then(function (response) {
            let mapquest_data = JSON.parse(response);
            if (mapquest_data && mapquest_data["results"]) {
                let locations = mapquest_data["results"][0]["locations"];
                console.log("mapquest data:", locations);
                for (let i=0; i < locations.length; i++) {
                    let possible_result = locations[i];
                    if (possible_result.adminArea1 == 'US') {
                        if (possible_result.adminArea3 == state_name) {
                            if (possible_result.adminArea5 == city_name) {
                                if (possible_result.adminArea4 != '') {
                                    county_state_coords.county = possible_result.adminArea4;
                                    county_state_coords.latitude = possible_result.latLng.lat;
                                    county_state_coords.longitude = possible_result.latLng.lng;
                                    county_state_coords.state = state_name;
                                    break;
                                } else {    // no county found, move on and try again
                                    continue;
                                }
                            }
                        }
                    }
                }
            } else {
                county_state_coords = {};
            } 
            console.log("county_state_coords in validateLocation():", county_state_coords);
            get_covid_data(county_state_coords, res);
        })
        .catch(function (err) {
            console.error(err);
            county_state_coords = {};
            get_covid_data(county_state_coords, res);
        });
}

// called by retrieve_covid_data - handles actual covidAPI
function covidReqHandler(county_state, callback){
    // results passed through covidData
    let covidData;

    // check if a county_state was found
    console.log("County results from validate_location():", county_state);
    if (Object.keys(county_state).length == 0) {
        console.log("no county found");
        covidData = false;
        callback(covidData);
    } else {
        // generate the api request url based on county name
        let covidAPI = "https://www.trackcorona.live/api/cities/"
        let county_substrings = county_state.county.split(" ");
        for (let i=0; i < county_substrings.length; i++) {
            covidAPI += county_substrings[i];
            covidAPI += "%20";
        }
        covidAPI = covidAPI.slice(0, -3);        // remove the last %20

        // send the request
        request(covidAPI, function(err, response, body) {
            if (!err && response.statusCode < 400) {
                let info = JSON.parse(response.body);
                let results = info.data;
                // console.log("results from request: ", results);

                // deal with none, single, multiple COVID API responses
                if (results.length == 0) {
                    covidData = false;
                    callback(covidData);
                } else if (results.length == 1) {
                    covidData = results[0];
                    console.log("found county COVID data (from single result):", covidData);
                    callback(covidData);
                } else {        // multiple county results, need to get the correct state
                    let state_to_find;
                    for (let j=0; j < states.length; j++) {
                        if (states[j].Code == county_state.state) {
                            state_to_find = states[j].State;
                        }
                    }
                    for (let i=0; i < results.length; i++) {
                        let state_cmp = results[i].location.split(",");
                        if (state_cmp[1].slice(1) == state_to_find) {
                            covidData = results[i];
                        }
                    }
                    console.log("found county COVID data (from multiple results):", covidData);
                    callback(covidData);
                }
            } else {
                if (response) {
                    console.log(response.statusCode);
                }
                covidData = false;
                callback(covidData);
            }
        });
    } 
}

// called by validate_location within main-input-handler - renders covidAPI results
function retrieve_covid_data(county_state_coords, res) {
    console.log("county_state_coords in retrieve_covid_data():", county_state_coords);

    // check for no county found
    if (county_state_coords == {}) {
        console.log("No county found.");
        res.render('no-results');
    } else if (county_state_coords["county"] !== "") {
        // get the COVID data for that county
        console.log("finding COVID data for... ", county_state_coords["county"]);
        covidReqHandler(county_state_coords, function(data){
            if (data != false) {
                console.log("covid_data:", data);

                // clean up date value
                last_updated = data.updated.split(" ");
                console.log(last_updated);

                data.updated = {
                    date: last_updated[0], 
                    time: last_updated[1].split(".")[0]
                }

                // finished, send
                res.render("results", {MAPBOX_KEY: process.env.MAPBOX_KEY, data: data} );
            } else {
                console.log("Error in finding the city/state.")
                res.render("no-results");
            }
        });
    }
    else {
        console.log('Error finding county.')
        res.render("404");
    }
}

app.get("/", function(req, res){
    var context = {};
    res.status(200);
    console.log(context);
    res.render("home");
});

app.get("/main-input-handler", function(req, res) {
    console.log("The user entered:", req.query.location);

    // acutal page rendering handled by retrieve_covid_data()
    // find the county corresponding to the city and state
    validateLocation(req.query.location, retrieve_covid_data, res);
});

// no need for /results route as that is handled my main-input-handler
// app.get("/results", function(req, res){
//     // serve successful city search
//     var context = {};
//     res.status(200);
//     console.log(context);
//     res.render("results", {MAPBOX_KEY: process.env.MAPBOX_KEY});
// });

app.get("/multiple-results", function(req, res){
    // user needs to select from multiple possible results
    var context = {};
    res.status(200);
    console.log(context);
    res.render("multiple-results");
});

app.get("/no-results", function(req, res){
    // unsuccessful initial search
    var context = {};
    res.status(200);
    console.log(context);
    res.render("no-results");
});

app.get("/about", function(req, res){
    // about page
    var context = {};
    res.status(200);
    console.log(context);
    res.render("about");
});

app.use(function(req,res){
    res.status(404);
    res.render('404');
});
    
app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function(){
    console.log(`Express started on http://${process.env.HOSTNAME}:${app.get('port')}; press Ctrl-C to terminate.`);
});