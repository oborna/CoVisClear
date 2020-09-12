// Project: CoVisClear - BeaverHacks Fall 2020
// Team Name: Beaver With a Byte
// Contributors: Patricia Booth, Rohit Chaudhary, Anjanette Oborn, Timothy Yoon
// Description: Node.js server utilizing the Handlebars templating engine in order to handle location requests, route to approrpriate APIs to retrieve County location/COVID data, and mapping API in order to render results or failed searches to user.


var express = require('express');
var request = require('request');
var states = require('./public/states.json');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 7500);

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());

// validation and request functions that will be used by routes
function validateLocation(user_input) {
    // validation and formatting for user-input received from form submit
    return      
    // return either {city:"validCityStr", state:"validStateStr"} or false
    // if false, route handler will render "no-results" view
}

function covidReqHandler(county_name, state_name) {
    // generate the api request url based on county name
    covidAPI = "https://www.trackcorona.live/api/cities/"
    county_substrings = county_name.split(" ")
    for (let i=0; i < county_substrings.length; i++) {
        covidAPI += county_substrings[i];
        covidAPI += "%20";
    }
    covidAPI = covidAPI.slice(0, -3) //remove the last %20 from url

    // send the request
    request(covidAPI, function(err, response, body) {
        if (!err && response.statusCode < 400) {
            let info = JSON.parse(response.body);
            console.log(info);
            // res.render('lookup', context);      func return info only, the route will render view
            // multiple results possible, need results based on state code
            let results = info.data;
            let covidData;
            if (results.length == 0) {
                // end func here, what do we return? false?
                return false;
            } else if (results.length == 1){
                covidData = results[0];
            } else {        // multiple county results, need to get the correct state
                
            }
            return covidData;
        } else {
            console.log(err);
            if (response) {
                console.log(response.statusCode);
            }
            next(err);
            return false;
        }
    });
}

// test covidReqHandler
covidReqHandler("riverside");

app.get("/", function(req, res){
    var context = {};
    res.status(200);
    console.log(context);
    res.render("home");
});

app.get("/validate-location", function(req, res) {
    console.log("The user entered:", req.query.location);
    // Check if the city/state pair exists

    // Find the county corresponding to the city and state

});

// app.get("/results", function(req, res){
//     // serve successful city search
//     // will the front-end handle request to api and handle api response?
//         // if so, then front end will request each page from server based on its response
//     var context = {};
//     res.status(200);
//     console.log(context);
//     res.render("results");
// });

// app.get("/multiple-results", function(req, res){
//     // user needs to select from multiple possible results
//     var context = {};
//     res.status(200);
//     console.log(context);
//     res.render("multiple-results");
// });

// app.get("/no-results", function(req, res){
//     // unsuccessful initial search
//     var context = {};
//     res.status(200);
//     console.log(context);
//     res.render("no-results");
// });

app.get("/about", function(req, res){
    // about page
    var context = {};
    res.status(200);
    console.log(context);
    res.render("about");
});

// example get and post routes from previous projects/assignments
// use as framework for this project

// app.get("/results", function(req, res){
//     res.status(200);
//     let context = {};
//     res.render("");
//     // request(api_url, function(err, response, body) {
//     //     if (!err && response.statusCode < 400) {
//     //         let info = JSON.parse(response.body);
//     //         for (let i = 0; i < 30; i++) {
//     //             team_names.push({team_id: info.data[i].id, full_name: info.data[i].full_name});
//     //         }
//     //         context.all_teams = team_names;
//     //         console.log(context);
//     //         res.render('lookup', context);
//     //     } else {
//     //         console.log(err);
//     //         if (response) {
//     //             console.log(response.statusCode);
//     //         }
//     //         next(err);
//     //     }
//     // });
// });


// app.post("/lookup", function(req, res){
//     // get all the teams names
//     let api_teams = "https://www.balldontlie.io/api/v1/teams";
//     let team_names = [];
//     let context = {};
//     console.log("id: " + req.body.teams + " season: " + req.body.season);
//     request(api_teams, function(err, response, body) {
//         if (!err && response.statusCode < 400) {
//             let info = JSON.parse(response.body);
//             for (let i = 0; i < 30; i++) {
//                 team_names.push({team_id: info.data[i].id, full_name: info.data[i].full_name});
//             }
//             context.all_teams = team_names;
        
//             // nested request for actual client input
//             let season = "seasons[]=";
//             let teamID = "&team_ids[]=";
//             let perPage = "&per_page=100";

//             // default is 2019 season and Atlanta Hawks
//             if (req.body.season < 1979 || req.body.season == null) {
//                 season += 2019;
//             } else {
//                 season += req.body.season;
//             }
//             if (req.body.teams < 1 || req.body.teams > 30) {
//                 teamID += 1;
//             } else{
//                 teamID += req.body.teams;
//             }
            
//             // build the API address
//             apiAddr = "https://www.balldontlie.io/api/v1/games?";
//             apiAddr += season + teamID + perPage;
//             console.log("request: " + apiAddr);

//             // context will be passed to handlebars to render data
//             request(apiAddr, function(err, response, body) {
//                 if (!err && response.statusCode < 400) {
//                     // all team names already added
//                     // current searched team
//                     context.team = context.all_teams[req.body.teams - 1].full_name;
//                     context.season = req.body.season;
//                     let body = JSON.parse(response.body);
//                     context.data = body.data;
//                     // clean up the date value context
//                     for (let i=0; i < context.data.length; i++) {
//                         context.data[i].date = context.data[i].date.slice(0,10);
//                         console.log("new date: " + context.data[i].date);
//                     }
//                     console.log("context team name: " + context.team);
//                     res.render("lookup", context);
//                 } else {
//                     if (response) {
//                         console.log(response.statusCode);
//                     }
//                     next(err);
//                 }
//             });
//         } else {
//             if (response) {
//                 console.log(response.statusCode);
//             }
//             next(err);
//         }
//     });
// });

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