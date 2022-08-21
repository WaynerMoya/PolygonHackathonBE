/* Importing the express module. */
const express = require('express')

/* Creating a new router object. */
const route = express.Router()

/* Importing the nftController.js file. */
const nftController = require('../controllers/nftController')

/* This is a middleware that is used to parse the request body. */
route.use(express.json())

/* This is a route that is used to create a single NFT. */
route.post('/create-one-nft', nftController.createOneNFT)

/* This is a route that is used to create a collection of NFTs. */
route.post('/create-collection-nfts', nftController.createCollectionNfts)

/* This is a route that is used to get the newest NFTs. */
route.get('/get-newest-nfts', nftController.getNewestNFTs)

/* This is a route that is used to get all the NFTs from a specific cause. */
route.get('/get-nfts-from-cause/:address', nftController.getNFTsFromCause)

/* This is a route that is used to get all the NFTs from a specific address and token id. */
route.get('/get-nfts-from-address-and-tokenid/:address/:id', nftController.getNFTsFromAddressAndTokenId)

/* This is a route that is used to get all the NFTs from a specific wallet. */
route.get('/get-nft-from-wallet/:wallet', nftController.getNFTsFromWallet)

/* This is a route that is used to trade an NFT. */
route.post('/tradeNft', nftController.tradeNft)

/* This is exporting the route object so that it can be used in other files. */
module.exports = route