var mongoose = require("mongoose");

//Saves a reference to the Schema constructor
var Schema = mongoose.Schema;

//Create new UserSchema object using Schema constructor
var ArticleSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    }
});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;