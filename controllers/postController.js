/* Importing the Moralis library. */
const Moralis = require("moralis/node");

/**
 * It takes a URL to an image, converts it to base64, uploads it to IPFS, 
 * and returns the IPFS hash
 * @param url - The path to the image file.
 * @returns The IPFS hash of the file.
 */
const uploadImage = async (file, name) => {

    try {

        /* Creating a new Moralis File object. */
        const fileIpfs = new Moralis.File(name, { base64: file });

        /* Uploading the file to IPFS. */
        await fileIpfs.saveIPFS({ useMasterKey: true })

        return fileIpfs.ipfs();

    } catch (error) {

        /* Returning a new error object. */
        return new Error(error);
    }
}

const postController = {

    /* This function is creating a new post. */
    createPost: async (req, res) => {
        try {

            /* Destructuring the request body. */
            const { ethAddress, title, description, image } = req.body

            /* This is a validation to make sure that all the fields are sent. */
            if (!ethAddress || !title || !description || !image) {
                return res.status(500).json({
                    message: 'please validate that all fields are sent',
                    success: false
                })
            }

            /* Uploading the image to IPFS and returning the IPFS hash. */
            const imageInIpfs = await uploadImage(image, title)

            /* This is a validation to make sure that the image was uploaded to IPFS successfully. */
            if (imageInIpfs instanceof Error) {

                return res.status(400).json({
                    message: imageInIpfs?.message,
                    success: false
                })
            }

            /* This is creating a new post object and saving it to the database. */
            const Post = Moralis.Object.extend("Post");

            const post = new Post();

            post.set("title", title);
            post.set("description", description);
            post.set("image", imageInIpfs);
            post.set("ethAddress", ethAddress);

            await post.save()

            /* This is a validation to make sure that the post was created successfully. */
            if (post?.error) {
                return res.status(400).json({
                    message: post?.error,
                    success: false
                })
            }

            return res.status(201).json({
                message: 'Create post successfully',
                success: true,
                post
            })

        } catch (error) {
            /* Returning a JSON object with the message and success. */
            return res.status(500).json({
                message: error?.message,
                success: false
            })
        }
    },
    /* This function is searching for posts by the name of the foundation. */
    getPostByFoundation: async (req, res) => {
        try {

            /* Destructuring the request parameters and making sure that the name of the foundation is
            sent. */
            const { name_foundation } = req.params

            if (!name_foundation) {
                return res.status(500).json({
                    message: 'Please send the name of foundation',
                    success: false
                })
            }

            const Post = Moralis.Object.extend("Post");

            const query = new Moralis.Query(Post);

            /* Searching for posts that have the same name_foundation as the one that was sent in the request
            parameters. */
            query.equalTo("name_foundation", name_foundation);

            /* Searching for posts that have the same ethAddress as the one that was sent in the request
            parameters. */
            const results = await query.find();

            /* This is checking if the results array is empty. If it is, it means that the foundation
                        does not have any posts yet. */
            if (results.length == 0) {
                return res.status(404).json({
                    message: 'This foundation does not have posts yet',
                    success: true
                })
            }

            /* Returning a JSON object with the message, success, and results. */
            return res.status(200).json({
                message: 'Post searching successfully',
                success: true,
                results
            })


        } catch (error) {
            /* Returning a JSON object with the message and success. */
            return res.status(500).json({
                message: error?.message,
                success: false
            })
        }
    },
    /* This function is searching for posts by the name of the foundation. */
    getPostByFoundationWallet: async (req, res) => {
        try {

            /* Destructuring the request parameters. */
            const { ethAddress } = req.params

            /* This is a validation to make sure that the ethAddress is sent. */
            if (!ethAddress) {
                return res.status(500).json({
                    message: 'Please send the ethAddress of foundation',
                    success: false
                })
            }

            /* This is creating a new query object that will be used to search for posts. */
            const Post = Moralis.Object.extend("Post");

            const query = new Moralis.Query(Post);

            /* Sorting the results by the date they were created. */
            query.descending('_created_at')

            /* Searching for posts that have the same ethAddress as the one that was sent in the request
            parameters. */
            query.equalTo("ethAddress", ethAddress);

            /* Searching for posts that have the same ethAddress as the one that was sent in the request
            parameters. */
            const results = await query.find();

            /* This is checking if the results array is empty. If it is, it means that the foundation
            does not have any posts yet. */
            if (results.length == 0) {
                return res.status(404).json({
                    message: 'This foundation does not have posts yet',
                    success: true
                })
            }

            return res.status(200).json({
                message: 'Post searching successfully',
                success: true,
                results
            })


        } catch (error) {
            /* Returning a JSON object with the message and success. */
            return res.status(500).json({
                message: error?.message,
                success: false
            })
        }
    }
}

/* Exporting the `postController` object so that it can be imported in other files. */
module.exports = postController