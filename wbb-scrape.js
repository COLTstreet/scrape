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

var jsonData = [];

//Make a request to url for HMTL
request('https://herhoopstats.com/stats/leaderboard/team/pace/2021/ncaa-d1-natl/', function (error, response, html) {
    if (!error && response.statusCode == 200) {
        //Load HTML into Cheerio
        var $ = cheerio.load(html);

        var paceData = [];

        //Load cheerio html, into cheerioTableParser plugin
        cheerioTableparser($);

        var data = $("table").parsetable(true, true, true);

        //Loop through matrix and created array of objects with associated properties
        for (var i = 1; i < data[0].length; i++) {
            var team = {
                "team": data[2][i],
                "pace": data[3][i]
            }
            paceData.push(team);
        }
        paceData.sort(compare);

        //oPPP Request
        request('https://herhoopstats.com/stats/leaderboard/team/pts_per_100_poss/2021/ncaa-d1-natl/', function (error, response, html) {
            if (!error && response.statusCode == 200) {
                //Load HTML into Cheerio
                var $ = cheerio.load(html);

                var oPPPData = [];

                //Load cheerio html, into cheerioTableParser plugin
                cheerioTableparser($);

                var data = $("table").parsetable(true, true, true);

                //Loop through matrix and created array of objects with associated properties
                for (var i = 1; i < data[0].length; i++) {
                    var team = {
                        "team": data[2][i],
                        "oPPP": data[3][i]
                    }
                    oPPPData.push(team);
                }
                oPPPData.sort(compare);

                //dPPP Request
                request('https://herhoopstats.com/stats/leaderboard/team/opp_pts_per_100_poss/2021/ncaa-d1-natl/', function (error, response, html) {
                    if (!error && response.statusCode == 200) {
                        //Load HTML into Cheerio
                        var $ = cheerio.load(html);

                        var dPPPData = [];

                        //Load cheerio html, into cheerioTableParser plugin
                        cheerioTableparser($);

                        var data = $("table").parsetable(true, true, true);

                        //Loop through matrix and created array of objects with associated properties
                        for (var i = 1; i < data[0].length; i++) {
                            var team = {
                                "team": data[2][i],
                                "dPPP": data[3][i]
                            }
                            dPPPData.push(team);
                        }
                        dPPPData.sort(compare);

                        // console.log(paceData);
                        // console.log(oPPPData);
                        // console.log(dPPPData);

                        //Consolidate Data
                        for(var i = 0; i < dPPPData.length; i++){
                            var team = {
                                "team": dPPPData[i].team,
                                "pace": paceData[i].pace,
                                "oPPP": oPPPData[i].oPPP,
                                "dPPP": dPPPData[i].dPPP
                            }
                            jsonData.push(team);
                        }

                        // console.log(jsonData);
                        // console.log("------------------------------------------------------------");


                        // Loop through cleaned data and add to the FireStore
                        for(var i = 0; i < jsonData.length; i++){
                            var ref = db.collection('wbb-teams').doc(jsonData[i].team);
                            // console.log(jsonData[i]);
                            ref.set(jsonData[i]);
                        }
                    }
                });
            }
        });
    }
});

function compare(a, b) {
    if (a.team < b.team)
        return -1;
    if (a.team > b.team)
        return 1;
    return 0;
}