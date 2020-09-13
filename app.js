// Project: CoVisClear - BeaverHacks Fall 2020
// Team Name: Beaver With a Byte
// Contributors: Patricia Booth, Rohit Chaudhary, Anjanette Oborn, Timothy Yoon
// Description: Node.js server utilizing the Handlebars templating engine in order to handle location requests, route to approrpriate APIs to retrieve County location/COVID data, and mapping API in order to render results or failed searches to user.


var express = require('express');
var request = require('request');
var request_promise = require('request-promise');
var states = require('./public/states.json');
var api_keys = require('./api-keys.js');
var mapquest_base_url = 'http://open.mapquestapi.com/geocoding/v1/address';

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
function validateLocation(user_input) {

    // Object to return
    let county_state_coords = {
        county: "",
        state: "",
        latitude: "",
        longitude: "",
        success: ""
    };

    // Remove all whitespace from the input string
    let raw_str = user_input.replace(/\s+/g, '');
    let comma_index = raw_str.indexOf(',');
    let city_name = raw_str.slice(0, comma_index);
    let state_name = raw_str.slice(comma_index + 1, raw_str.length);
    let county_name = undefined;
    let latitude = undefined;
    let longitude = undefined;

    // Build the URL for the call to the API
    let mapquest_url = mapquest_base_url + `?key=${api_keys.mapquestKey}&location=${raw_str}`;
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
                // If the county info doesn't exist, then the city/state pair is invalid
                if (locations[0]["adminArea4"] === "") {
                    county_state_coords["success"] = false;
                }
                county_name = locations[0]["adminArea4"];
                latitude = locations[0]["displayLatLng"]["lat"];
                longitude = locations[0]["displayLatLng"]["lng"];
            } else {
                county_state_coords["success"] = false;
            } 
            county_state_coords["county"] = county_name;
            county_state_coords["state"] = state_name;
            county_state_coords["latitude"] = latitude;
            county_state_coords["longitude"] = longitude;
            
            console.log("county_state_coords in validateLocation():", county_state_coords);
            county_state_coords["success"] = true;
            return county_state_coords;
        })
        .catch(function (err) {
            console.error(err);
            county_state_coords["success"] = false;
            return county_state_coords;
        });
}

// request the COVID API using validated, user-inputted city/state
function covidReqHandler(county_state) {
    // generate the api request url based on county name
    let covidAPI = "https://www.trackcorona.live/api/cities/"
    let county_substrings = county_state.county.split(" ");
    for (let i=0; i < county_substrings.length; i++) {
        covidAPI += county_substrings[i];
        covidAPI += "%20";
    }
    covidAPI = covidAPI.slice(0, -3);        // remove the last %20

    // send the request
    let options = {
        method: "GET",
        uri: covidAPI
    }

    request_promise(options)
        .then(function (response) {
            let info = JSON.parse(response);
            let results = info.data;
            let covidData;

            if (results.length == 0) {
                return false;
            } else if (results.length == 1){
                covidData = results[0];
                return covidData;
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
                console.log("found county COVID data:", covidData);
                return covidData;
            }
        })
        .catch(function (err) {
            console.log(err);
            if (response) {
                console.log(response.statusCode);
            }
            return false;
            // res.render("no-results");
        });
}

// test covidReqHandler and validate location, REMOVE AFTER COMPLETING
// let test_county_state = {county: "Orange", state: "CA"};
// let some_data = covidReqHandler(test_county_state);
// console.log("result: ", some_data);

app.get("/", function(req, res){
    var context = {};
    res.status(200);
    console.log(context);
    res.render("home");
});

app.get("/main-input-handler", function(req, res) {
    console.log("The user entered:", req.query.location);

    // Find the county corresponding to the city and state
    let county_state_coords = validateLocation(req.query.location);
    console.log("in main handler, county_state_coords is:", county_state_coords);
    if (county_state_coords) {
        // get the COVID data for that county
        let covid_data = covidReqHandler(county_state_coords);
        if (covid_data) {
            res.render("results", covid_data);
        }
        // res.render("results", county_state_coords);   
    } else {
        res.render("no-results");
    }
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