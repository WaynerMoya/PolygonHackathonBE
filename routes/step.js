/* Importing the express module. */
const express = require('express')

/* Creating a new router object. */
const route = express.Router()

/* Importing the nftController.js file. */
const stepController = require('../controllers/stepController')

/* This is a middleware that is used to parse the request body. */
route.use(express.json())

/* This is creating a new route for the `/create-nft` endpoint. */
route.get('/get-steps-by-address/:wallet', stepController.getStepByAddress)

/* This is exporting the route object so that it can be used in other files. */
module.exports = route