var cheerio = require('cheerio');
var axios = require('axios');
var cheerioTableparser = require('cheerio-tableparser');
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

const config = {
  headers: {
    'Accept-Encoding': 'application/json',
  }
};

const scrapeNBA = async () => {
  try {
    const res = await axios.get('https://www.basketball-reference.com/leagues/NBA_2023.html#advanced-team', config)

    //Load HTML into Cheerio
    var $ = cheerio.load(res.data);

    //Load cheerio htl, into cheerioTableParser plugin
    cheerioTableparser($);

    var jsonData = [];
    var data = $("#advanced-team").parsetable(true, true, true);

    //Loop through matrix and created array of objects with associated properties
    for (var i = 1; i < data[0].length; i++) {
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
      // console.log(team.team);
    }
    //Remove initial elment bc its filled with the titles of the columns
    jsonData.splice(0, 1);

    const _datarwt = [];
    // //Loop through cleaned data and add to the FireStore
    for (var i = 0; i < jsonData.length; i++) {
      _datarwt.push(db.collection('nba-teams').doc(jsonData[i].team).set(jsonData[i]));
    }

    const _dataloaded = await Promise.all(_datarwt)
      .then(() => {
        console.log('NBA COMPLETE')
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    // Handle Error Here
    console.error(err);
  }
};

scrapeNBA();