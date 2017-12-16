// server.js
// where your node app starts

// init
// setup express for handling http reqs
var express = require("express");
var app = express();
var path = require('path');
var google = require('googleapis');
var customsearch = google.customsearch('v1');
const CX = process.env.CX;
const API_KEY = process.env.API_KEY;
//const SEARCH = 'lolcats funny';

app.listen(3000, function(){
    console.log('listening on 3000')
  });

var MONGODB_URI = 'mongodb://'+process.env.USER+':'+process.env.PASS+'@'+process.env.HOST+':'+process.env.DB_PORT+'/'+process.env.DB;
var mongoose = require('mongoose');
mongoose.connect(MONGODB_URI);

var historySchema = mongoose.Schema({
  term: String,
  when: Date
});

var History=mongoose.model('History',historySchema);
// create routes
app.get("/", function (req, response) {
  try {
    console.log("Entro a / ");
    /*customsearch.cse.list({ cx: CX, q: SEARCH, auth: API_KEY, searchType: 'image' }, function (err, resp) {
  if (err) {
    return console.log('An error occured', err);
  }
  // Got the response from custom search
  console.log('Result: ' + resp.searchInformation.formattedTotalResults);
  if (resp.items && resp.items.length > 0) {
    console.log('First result name is ' + resp.items[0].title);
  }
      response.json(resp.items);
});
    
    */
   response.sendFile(path.join(__dirname + '/views/index.html'));

  } catch (err) {
    console.log("Error: " + err);
  }
});

app.get("/api/imagesearch/:name", function (req, response) {
  try {
    console.log("Lo que buscan "+req.params.name);
    console.log("El offset "+req.query.offset);
    //response.json(req.params.name+"  "+req.query.offset);
    var search=req.params.name;
    var offset=req.query.offset;
    if(offset=== undefined || isNaN(offset) || parseInt(offset)==0)
      offset=1;
    else
      offset=parseInt(offset);
    
    var results=[];
    console.log("Offset convertido "+offset);
    if(offset > 91 )
      offset=91;
    customsearch.cse.list({ cx: CX, q: search, auth: API_KEY, searchType: 'image',num: 10, start: offset }, function (err, resp) {
    if (err) {
      return console.log('An error occured', err);
    }
  // Got the response from custom search
      
      if (resp.items && resp.items.length > 0) {
      resp.items.forEach(function(item,index){
      var unResult={url: item.link,snippet:item.snippet,thumbnail:item.image.thumbnailLink,context:item.image.contextLink};
      results.push(unResult);      
      });
      //console.log('First result name is ' + resp.items[0].title);
    }
    var estaBusqueda = new History({
      term: search,
      when: Date.now()
    });
    estaBusqueda.save(function (err, fluffy) {
      
      if (err) return console.error(err);
    });
    response.json(results);
});
  } catch (f) {
    console.log("Error "+f);
  }
});

app.get("/api/latest/imagesearch", function (req, response) {
  try {
    console.log("Entro al historial");
    History.find({},{_id: 0,__v:0 }).limit(10).sort('-when').exec(function(err,result){
      response.json(result);
    });
  } catch (f) {
    console.log("Error "+f);
  }
});



