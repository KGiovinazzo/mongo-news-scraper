// var bodyParser = require("body-parser");

var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

//Scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

//Requiring all models
var db = require("models");

var PORT = 3000;

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

    })
})

