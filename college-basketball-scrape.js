var request = require('request');
var cheerio = require('cheerio');
var cheerioTableparser = require('cheerio-tableparser');
const axios = require('axios');
const requestP = require('request-promise');
const admin = require('firebase-admin');


//Service Account for access
var serviceAccount = {
  "type": "service_account",
  "project_id": "hoopfire-api",
  "private_key_id": "a9d366bac3abc2f55bca7a4fa84512befed452f2",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQClK1e7TvHr33A8\nHZyprZgt2lMGWjS2Gb9R99k6nnLO4XortXfcdA1YKg4/LlfKrzJNcNtD9AOP07gz\nkbsYLalAPv2sEdHLOej96GNxZScyU8wBNDJ/XMD4PK4AnZUuj4JAbxlrNamX3NBs\nxGgpus2qH3m2rjyFZXhBlJJ7RbvloT08te21VcZYnOut+rwPrX7UGekobVHAbB0n\nyTQGnY62kvPEIJLaMIvCGEgVRpGtwLvi8ODuTio74z8vLoRTbg+KFGiGF/28wo5b\np6Dw07B7fYPdp3J9CW0usFgs38wegdINK9ZohcJVsfd7SsPovlu76k4KiJ7oCSbB\n5u+mlT21AgMBAAECggEAC+FkPBrfl+HIhupyXFoaOiIcGrbeV8LeWh0DyQ2goHTj\nfsVcy8SlORQ9VhoVQoT7j0pw2yBwKSZHd54h4QlXxUFCqd/WQVH3Clxu2rc17I7O\ne7+vai3Xy4NB2NV85453Bf93yphfjIbbjxdJjsbbCEOfU56Qx9+WmNEBAFDxxQCI\nU9Ube0ifKcPV2kEm0d3qLOf78JrUfq4YVwic3UckeVbZpNNrWX/YB4SfJg7vRJ/p\nnTxDoux9kWnU41D4uvBGQeo3k1WySJHco8d1Qgu7MKdDWNUqpiFd8S1Tvg/QHSg1\nPps6TZbdzlukJt+E5x296voM2pVHuBAIwUbG6CkwAQKBgQDj+PcTGVnqfanrAjFc\n1oAbypdhVpIlWRojCpEZ791h7oWGkSuhdxcFSO/97wliJoX3qOxiRGExasSdEfM3\neV68+rPKwFPU2Lf5usAANPEuK3eHqkh2ezmr3WqJYI/MV0NR89/NcY3zJ2Oox3Jg\neAlOQUwVtbNDbnnTdM2sE4DmAQKBgQC5ecG3El2xzRnoHqTtqvakz9Pxr2JWIzAk\noQXtrBe67eLn1x8TOW+uQpk16RXnir/poroMOuqqE/L0YVbioi2rSUvmIgSWd2u5\nJFIe3DKZGbFEbEGUGlttVJIc0K5fvTv7AQz9hBnWgAM6eP69qbGhJzSMlJTvAao3\niKTSPZiftQKBgQDd7GDpUMZ9RTOCOTJAg/dWFpPjB9lhTinpbsHuE9jZGs8VPoDQ\nwBPC60vlUSs7RvEnNGRZDOPorV0U4oJ3wEj/grY/a5awHwCJtMhv6xnVri6//H5q\nCG8N5Y9uiHeznkdEojl9z0s2J2QWy4GGc5PrgBlHEQifXg5uUMhe+OWEAQKBgBGb\nIi1LnAM9seDbz9ITsXfxlm/Rsyb0DiTb+CEYfeQroqdZP0Tm5dgH0F1Ss9aX0CHQ\nZZK1oQLmA+D4wHOg627f9UlyHzddPKeFcBon0tG/o5kYIZ16ZwVYysnbcUH7R49L\nCT2jZYR8AFJzm9LLIeZnP1C85epOISdGXEbsu+klAoGBAOOVb6r4aJFzLHamZ5+H\nS5ggjg8ARQvccLVMqrw0a+hMqnMnKsNlj2rIYlYNrFegasrYJ5COkhBg3cqI/o6N\n9OFZuDoavA91fUKCxO4vXmaW6/QRe+p5e4ey7mTawJsCk2E0SwZBD11bopEssvZP\n4syDbeiae1DX5b1BUmtv56es\n-----END PRIVATE KEY-----\n",
  "client_email": "hoopfire-admin@hoopfire-api.iam.gserviceaccount.com",
  "client_id": "116333503444229940434",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://accounts.google.com/o/oauth2/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/hoopfire-admin%40hoopfire-api.iam.gserviceaccount.com"
}

//Init app
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

var db = admin.firestore();

var options = {
  uri: `http://api.scraperapi.com/`,
  qs: {
    'api_key': '23f4e9c6c8768dce74cb520cd744db10',
    'url': 'https://kenpom.com'
  },
  retry: 5,
  verbose_logging: false,
  accepted: [200, 404, 403],
  delay: 5000,
  factor: 2,
  resolveWithFullResponse: true
}

try {
  console.log("START")
  const response = requestP(options);
  response.then(fullResponse => {

    let $ = cheerio.load(fullResponse.body);

    //Load cheerio htl, into cheerioTableParser plugin
    cheerioTableparser($);

    var jsonData = [];
    var data = $("#ratings-table").parsetable(true, true, true);


    console.log("CREATE DATA")

    //Loop through matrix and created array of objects with associated properties
    for (var i = 0; i < data[0].length; i++) {
      var team = {
        "rank": data[0][i],
        "team": data[1][i].replace(/\d+/g, '').trim(),
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


    console.log("ADD TO FIRESTORE")

    //Loop through cleaned data and add to the FireStore
    for (var i = 0; i < jsonData.length; i++) {
      var testRef = db.collection('college-teams').doc(jsonData[i].team);
      testRef.set(jsonData[i]);
    }


    console.log("END")
  })
} catch (e) {
  console.log(e);
  return e
}