var request = require('request');
var cheerio = require('cheerio');
var cheerioTableparser = require('cheerio-tableparser');

//firebase SDK
const admin = require('firebase-admin');
//Service Account for access
var serviceAccount = require("C:\\Users\\cks\\Documents\\personal\\scrape\\Hoopfire-API-a9d366bac3ab.json");

//Init app
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

var db = admin.firestore();

//Make a request to KenPom url for HMTL
request('https://kenpom.com/', function (error, response, html) {
  if (!error && response.statusCode == 200) {
    
    //Load HTML into Cheerio
    var $ = cheerio.load(html);

    //Load cheerio htl, into cheerioTableParser plugin
    cheerioTableparser($);

    var jsonData = [];
    var data = $("#ratings-table").parsetable(true, true, true);

    //Loop through matrix and created array of objects with associated properties
    for(var i = 0; i < data[0].length; i++){
        var team = {
            "rank": data[0][i],
            "team": data[1][i].replace(/\d+/g,'').trim(),
            "conference": data[2][i],
            "winLoss": data[3][i],
            "adjEM": data[4][i],
            "adjO": data[5][i],
            "adjD": data[7][i],
            "adjT": data[9][i],
            "luck": data[11][i],
            "oppO": data[15][i],
            "oppD": data[17][i]
        }
        jsonData.push(team);
    }

    //Due to the nature of the table at KenPom, some data cleanup is needed
    //Loop backwards and remove items that meet the criteria
    var i = jsonData.length
    while (i--) {
        if (jsonData[i].rank === "" || jsonData[i].rank === "Rank") { 
            jsonData.splice(i, 1);
        } 
    }

    //Loop through cleaned data and add to the FireStore
    for(var i = 0; i < jsonData.length; i++){
        var testRef = db.collection('college-teams').doc(jsonData[i].team);
        testRef.set(jsonData[i]);
    }
  }
});