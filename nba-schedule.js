var request = require('request');
var cheerio = require('cheerio');
var cheerioTableparser = require('cheerio-tableparser');

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
request('https://www.basketball-reference.com/leagues/NBA_2020_games-april.html', function (error, response, html) {
  if (!error && response.statusCode == 200) {
    
    //Load HTML into Cheerio
    var $ = cheerio.load(html);

    //Load cheerio htl, into cheerioTableParser plugin
    cheerioTableparser($);

    var jsonData = [];
    var data = $("#schedule").parsetable(true, true, true);

    var date = new Date();
    date.setDate(date.getDate() - 1);

    //Loop through matrix and created array of objects with associated properties
    for(var i = 0; i < data[0].length; i++){
      var tempDate = new Date(data[0][i].replace(/,/g, ''));
      if(tempDate > date) {
        var matchup = {
            "prettyDate": data[0][i],
            "date": tempDate.toISOString(),
            "start": data[1][i],
            "away": data[2][i],
            "home": data[4][i]
        }
        jsonData.push(matchup);
      }
    }

    // //Loop through cleaned data and add to the FireStore
    for(var i = 1; i < jsonData.length; i++){
        var testRef = db.collection('nba-schedule').doc(jsonData[i].prettyDate + "-" + i);
        testRef.set(jsonData[i]);
    }
  }
});