/* Importing the express module. */
const express = require('express')

/* Creating a new router object. */
const route = express.Router()

/* Importing the nftController.js file. */
const causeController = require('../controllers/causesController')

/* This is a middleware that is used to parse the request body. */
route.use(express.json())

/* This is a route that is used to create a cause by a wallet. */
route.post('/create-cause-by-wallet', causeController.createCauseByWallet)

/* This is a route that is used to get a cause by a wallet. */
route.post('/get-cause-by-wallet/:wallet', causeController.getCauseByWallet)

/* This is a route that is used to get the steps of a cause by its address. */
route.get('/get-steps-by-address/:address', causeController.getStepsByAddress)

/* This is exporting the route object so that it can be used in other files. */
module.exports = route