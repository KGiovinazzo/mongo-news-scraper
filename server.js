// var bodyParser = require("body-parser");

var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

//Scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

//Requiring all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

//Initializing Express
var app = express();

//Using morgan logger for logging requests
app.use(logger("dev"));

//Parse request body as a JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

//Connect to MongoDB
mongoose.connect("mongodb://localhost/", { mongoNews: true });

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoNews";

mongoose.connect(MONGODB_URI);

//Routes

//GET route
app.get("/scrape", function (req, res) {
    //Use axios to grab HTML body
    axios.get("https://www.echojs.com/").then(function (response) {
        var $ = cheerio.load(response.data);

        //Grab all h2's in article

        $("article h2").each(function (i, element) {

            //Save empty result object
            var result = {};

            //Add text and href of every link then save as properties of result
            
            result.title = $(this)
            .children("a")
            .text();
            result.link = $(this)
            .children("a")
            .attr("href");

            //Create a new article using the 'result' object from scraping

            db.Article.create(result)
            .then(function(dbArticle) {
                console.log(dbArticle);
            })
            .catch(function(err) {
                console.log(err);
            });
        });

        //Sends a message to the client
        res.send("Scrape Successful!");
    });
});

//Route for obtaining all articles from the database
app.get("/articles", function(req, res){
    db.Article.find({})
    .then(function(dbArticle) {
        //Send articles back to client if successfully found
        res.json(dbArticle);
    })
    .catch(function(err) {
        //Send error to client if one occurs
        res.json(err);
    });
});

//Grabbing an article by its id, then populating with its note
app.get("/articles/:id", function(req, res){
    //Prep query to find a matching id
    db.Article.findOne({_id: req.params.id})
    //then populate with all associated notes
    .populate("note")
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err){
        res.json(err);
    });
});

//Route for saving or updating an article's associated note
app.post("/articles/:id", function(req, res) {
    //Create a new note then pass it to the req.body
    db.Note.create(req.body)
    .then(function(dbNote){
        return db.Article.findOneAndUpdate({ _id: req.params.id }, {note: dbNote._id }, {new: true});
    })
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err){
        res.json(err);
    });
});

// Starting the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });