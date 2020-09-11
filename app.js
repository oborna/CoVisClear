// Project: CoVisClear - BeaverHacks Fall 2020
// Team Name: Beaver With a Byte
// Contributors: Patricia Booth, Rohit Chaudhary, Anjanette Oborn, Timothy Yoon
// Description: Node.js server utilizing the Handlebars templating engine in order to handle location requests, route to approrpriate APIs to retrieve County location/COVID data, and mapping API in order to render results or failed searches to user.


var express = require('express');
var request = require('request');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 7500);

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.get("/", function(req, res){
    var context = {};
    res.status(200);
    console.log(context);
    res.render("home");
});

app.get("/results", function(req, res){
    // serve successful city search
    // will the front-end handle request to api and handle api response?
        // if so, then front end will request each page from server based on its response
    var context = {};
    res.status(200);
    console.log(context);
    res.render("home");
});

app.get("/multiple-results", function(req, res){
    // user needs to select from multiple possible results
    var context = {};
    res.status(200);
    console.log(context);
    res.render("home");
});

app.get("/no-results", function(req, res){
    // unsuccessful initial search
    var context = {};
    res.status(200);
    console.log(context);
    res.render("home");
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