const express = require('express');
const graphqlHTTP = require('express-graphql');
const schema = require('./schema/schema');
const app = express();
const db = require('./db/db')
const cors = require('cors')

//Allow cross origin requests.
app.use(cors());

// Binding Express with GraphQL
app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}));

// Server Port
app.listen(2000, () => {
    console.log('now listening for requests on port 2000');
});

