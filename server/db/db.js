const mongoose = require('mongoose');


// Mongoose Setup
mongoose.set('debug', true);
var db = mongoose.connect('mongodb://localhost:27017/imagedb' , {useNewUrlParser : true} , (err) => {
    if(!err) {console.log("MongoDb Connected")}
    else {console.log(err)}
})


module.exports = {
    db
}