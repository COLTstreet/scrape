var request = require('request');
var cheerio = require('cheerio');
var cheerioTableparser = require('cheerio-tableparser');


// node C:\Users\cks\Documents\personal\development\scrape\nba-scrape.js

//firebase SDK
const admin = require('firebase-admin');
//Service Account for access
var serviceAccount = require("C:\\Users\\cks\\Documents\\personal\\development\\scrape\\Hoopfire-API-a9d366bac3ab.json");

//Init app
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

var db = admin.firestore();

//Make a request to KenPom url for HMTL
request('https://widgets.sports-reference.com/wg.fcgi?css=1&site=bbr&url=%2Fleagues%2FNBA_2022.html&div=div_advanced-team', function (error, response, html) {
  if (!error && response.statusCode == 200) {
    //Load HTML into Cheerio
    var $ = cheerio.load(html);

    //Load cheerio htl, into cheerioTableParser plugin
    cheerioTableparser($);

    var jsonData = [];
    var data = $("#advanced-team").parsetable(true, true, true);

    //Loop through matrix and created array of objects with associated properties
    for(var i = 1; i < data[0].length; i++){
        var team = {
            "rank": data[0][i],
            "team": data[1][i],
            "wins": data[3][i],
            "losses": data[4][i],
            "oRtg": data[10][i],
            "dRtg": data[11][i],
            "pace": data[13][i]
        }
        jsonData.push(team);
        console.log(team.team);
    }
    //Remove initial elment bc its filled with the titles of the columns
    jsonData.splice(0, 1);

    // //Loop through cleaned data and add to the FireStore
    for(var i = 0; i < jsonData.length; i++){
        var ref = db.collection('nba-teams').doc(jsonData[i].team);
        ref.set(jsonData[i]);
    }
  }
});