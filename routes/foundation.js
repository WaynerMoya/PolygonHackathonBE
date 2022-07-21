/* Importing the express module. */
const express = require('express')

/* Creating a new router object. */
const route = express.Router()

/* Importing the foundationController.js file. */
const foundationController = require('../controllers/foundationController')

/* This is a route that is being created. The first parameter is the path that the route will be
listening to. The second parameter is the function that will be executed when the route is called. */
route.post('/create-foundation', foundationController.createFoundation)

/* Exporting the route object so that it can be used in other files. */
module.exports = route;