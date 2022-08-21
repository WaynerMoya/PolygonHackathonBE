/* Importing the express module. */
const express = require('express')

/* Creating a new router object. */
const route = express.Router()

/* Importing the postController.js file. */
const postController = require('../controllers/postController')

/* Creating a new post. */
route.post('/create-post', postController.createPost)

/* This is a route that will be used to get all the posts by a specific foundation. */
route.get('/get-posts-by-foundation-name/:name_foundation', postController.getPostByFoundation)

/* This is a route that will be used to get all the posts by a specific foundation. */
route.get('/get-posts-by-foundation-wallet/:ethAddress', postController.getPostByFoundationWallet)

/* Exporting the route object so that it can be used in other files. */
module.exports = route;