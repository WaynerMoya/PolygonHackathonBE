/* Importing the express module. */
const express = require('express')

/* Creating a new router object. */
const route = express.Router()

/* Importing the nftController.js file. */
const causeController = require('../controllers/causesController')

/* This is a middleware that is used to parse the request body. */
route.use(express.json())

route.post('/create-cause-by-wallet', causeController.createCauseByWallet)

/* This is creating a new route for the `/create-nft` endpoint. */
route.get('/get-cause-by-wallet/:wallet', causeController.getCauseByWallet)

/* This is exporting the route object so that it can be used in other files. */
module.exports = route