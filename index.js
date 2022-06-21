/****************************************************************************************** */
/****************************************************************************************** */
/******************************* DECLARE LIBRARY AND MODULES ****************************** */
/****************************************************************************************** */
/****************************************************************************************** */

/* Importing the express module. */
const express = require('express')

/* Setting the port to the environment variable PORT or 3001 
if the environment variable is not set. */
const port = process.env.PORT || 3001;

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

/* Creating an instance of the express module. */
const app = express()

/* Telling the server to use the routes in the file `routes/nft.js` when the path starts with `/nft`. */
app.use('/nft', nft)

/* Telling the server to parse the body of the request as JSON. */
app.use(express.json())

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