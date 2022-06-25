/* Importing the express module. */
const express = require('express')

/* Creating a new router object. */
const route = express.Router()

/* Importing the nftController.js file. */
const nftController = require('../controllers/nftController')

/* This is a middleware that is used to parse the request body. */
route.use(express.json())

/* This is creating a new route for the `/create-nft` endpoint. */
route.post('/create-nft', nftController.createNft)

/* This is exporting the route object so that it can be used in other files. */
module.exports = route