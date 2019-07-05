const express = require('express');
const graphqlHTTP = require('express-graphql');
const schema = require('./schema/schema');
const mongoose = require('mongoose');
const app = express();

// Mongoose Setup
mongoose.set('debug', true);
mongoose.connect('mongodb://localhost:27017/imagedb' , {useNewUrlParser : true} , (err) => {
    if(!err) {console.log("MongoDb Connected")}
    else {console.log(err)}
})

// Binding Express with GraphQL
app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}));

// Server Port
app.listen(2000, () => {
    console.log('now listening for requests on port 4000');
});
