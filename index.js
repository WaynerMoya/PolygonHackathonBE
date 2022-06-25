/****************************************************************************************** */
/****************************************************************************************** */
/******************************* DECLARE LIBRARY AND MODULES ****************************** */
/****************************************************************************************** */
/****************************************************************************************** */
const cors = require("cors")
/* Importing the express module. */
const express = require('express')

/* Setting the port to the environment variable PORT or 3001 
if the environment variable is not set. */
const port = process.env.PORT || 3001;

/* Importing the ParseServer module from the parse-server package. */
//const ParseServer = require('parse-server').ParseServer;


/* Setting the environment variable to the value of the environment 
variable NODE_ENV or 'local' if the environment variable NODE_ENV is not set. */
const environment = process.env.NODE_ENV || 'local'

/* Importing the file `routes/nft.js` and assigning it to the variable `nft`. */
const nft = require('./routes/nft')
/****************************************************************************************** */
/****************************************************************************************** */
/**************************************** START CODE ************************************** */
/****************************************************************************************** */
/****************************************************************************************** */

/* 
const parseServer = new ParseServer({
    serverUrl: process.env.MORALIS_SERVER_URL,
    appId: process.env.MORALIS_API_ID,
    masterKey: process.env.MORALIS_MASTER_KEY
});
 */

/* Creating an instance of the express module. */
const app = express()


/* This is a middleware function that is used to tell the server to parse the body of the request as
JSON. */
//app.use(process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0", parseServer);
const whitelist = ["http://localhost:3000"]
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
}

app.use(cors(corsOptions))
/* Telling the server to use the routes in the file `routes/nft.js` when the path starts with `/nft`. */

/* Telling the server to parse the body of the request as JSON. */
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));

app.use('/nft', nft)
/* This is a route handler. It is listening for a GET request to the root of the server. When it
receives a GET request, it will send the response 'Hello World!'. */
app.get('/', (req, res) => res.send('Hello World!'))

/****************************************************************************************** */
/****************************************************************************************** */
/***************************************** LISTENER *************************************** */
/****************************************************************************************** */
/****************************************************************************************** */

/* Telling the server to listen for requests on the port specified by the variable `port`. */
app.listen(port, () => {

    /* Using a template literal to print the value of the variable `port` to the console. */
    console.log(`Server is running on port ${port}`)

    /* Using a template literal to print the value of the variable `environment` to the console. */
    console.log(`Environment: ${environment}`)
})