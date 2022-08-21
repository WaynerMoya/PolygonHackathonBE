/* Importing the express module. */
const express = require('express')

/* Creating a new router object. */
const route = express.Router()

/* Importing the foundationController.js file. */
const foundationController = require('../controllers/foundationController')

/* Creating a new route for the post request. */
route.post('/create-foundation', foundationController.createFoundation)

/* This is a route that will be used to get all the foundations from moralis tables. */
route.get('/get-foundations', foundationController.getFoundations)

/* This is a route that will be used to get a foundation by email from the moralis tables. */
route.get('/get-foundation-by-email/:email', foundationController.getFoundationByEmail)

/* This is a route that will be used to get a foundation by wallet from the moralis tables. */
route.get('/get-foundation-by-wallet/:wallet', foundationController.getFoundationByWallet)

/* Exporting the route object so that it can be used in other files. */
module.exports = route;