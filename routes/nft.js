/* Importing the express module. */
const express = require('express')

/* Creating a new router object. */
const route = express.Router()

/* Importing the nftController.js file. */
const nftController = require('../controllers/nftController')

/* This is a middleware that is used to parse the request body. */
route.use(express.json())

route.post('/create-one-nft', nftController.createOneNFT)

/* This is creating a new route for the `/create-nft` endpoint. */
route.post('/create-collection-nfts', nftController.createCollectionNfts)

route.get('/get-newest-nfts', nftController.getNewestNFTs)

route.get('/get-nfts-from-cause/:address', nftController.getNFTsFromCause)

route.get('/get-nfts-from-address-and-tokenid/:address/:id', nftController.getNFTsFromAddressAndTokenId)

route.get('/get-nft-from-wallet/:wallet', nftController.getNFTsFromWallet)

route.post('/tradeNft', nftController.tradeNft)

/* This is exporting the route object so that it can be used in other files. */
module.exports = route