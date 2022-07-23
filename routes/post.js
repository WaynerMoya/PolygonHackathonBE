/* Importing the express module. */
const express = require('express')

/* Creating a new router object. */
const route = express.Router()

const postController = require('../controllers/postController')

route.post('/create-post', postController.createPost)

route.get('/get-posts-by-foundation-name/:name_foundation', postController.getPostByFoundation)


/* Exporting the route object so that it can be used in other files. */
module.exports = route;