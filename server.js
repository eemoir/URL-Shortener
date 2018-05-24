// init project, get requirements
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var app = express();
app.use(bodyParser.json());

var uri = 'mongodb://'+process.env.USER+':'+process.env.PASS+'@ds063809.mlab.com:63809/url-shortener';

//connect to database
mongoose.connect(uri, function (err, db) {
 if (err) {
  console.log("unable to connect to database", err); 
 }
  else {
  console.log("connection established to database @ ", uri); 
  }
});

var db = mongoose.connection,
    appURL = "https://aboard-punishment.glitch.me/";

//get request for /new/:longURL
app.get('/new/:longURL(*)', function (req, res) {
  var longURL = req.params.longURL;
  //check that the longURL is a valid URL
  var urlCheck = new RegExp("^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$");
  if (!urlCheck.test(longURL)) {
   res.json({"error": "please enter a valid URL"}); 
  }
  else {
//create corresponding shortURL
  var num = Math.floor(Math.random()*100000).toString(),
      shortURL = appURL + num,
   URLs = {
    'longURL': longURL,
    'shortURL': shortURL
  };
  db.collection('shorturls').insert(URLs, function (error, data) {
    if (error) {
     console.log('error updating to database'); 
    }
  });
  return res.json({'longURL': URLs.longURL, 'shortURL': URLs.shortURL});
  }
});

app.get('/:shortURL', function (req, res) {
  var short = appURL + req.params.shortURL;
  console.log(short + " is the short url");
  var query = {'shortURL': short};
  db.collection('shorturls').findOne(query, function (error, data) {
    if (error) {
     console.log('there was an error searching the database'); 
    }
    else {
      if (data) {
          console.log(data.longURL);
          var re = new RegExp("^(http|https)://", "i");
          if (!re.test(data.longURL)) {
           console.log('this does not contain https'); 
            res.redirect(301, 'https://' + data.longURL);
          }
         else {
           res.redirect(301, data.longURL);
         }
      }
      else {
       console.log('nothing matched that search'); 
      }
    }
  });
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));


// listen for reequests
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
