/* Importing the Moralis library. */
const Moralis = require("moralis/node");

/* This is how you can use environment variables in Node.js. */
const serverUrl = process.env.MORALIS_SERVER_URL
const appId = process.env.MORALIS_API_ID
const masterKey = process.env.MORALIS_MASTER_KEY
const chainMoralis = process.env.MORALIS_CHAIN

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

    createPost: async (req, res) => {
        try {


            const { ethAddress, title, description, image } = req.body

            if (!ethAddress || !title || !description || !image) {
                return res.status(500).json({
                    message: 'please validate that all fields are sent',
                    success: false
                })
            }

            /* Initializing the Moralis library. */
            await Moralis.start({ serverUrl, appId, masterKey });

            const imageInIpfs = await uploadImage(image, title)

            if (imageInIpfs instanceof Error) {

                return res.status(400).json({
                    message: imageInIpfs?.message,
                    success: false
                })
            }

            const Post = Moralis.Object.extend("Post");

            const post = new Post();

            post.set("title", title);
            post.set("description", description);
            post.set("image", imageInIpfs);
            post.set("ethAddress", ethAddress);

            await post.save()

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
    getPostByFoundation: async (req, res) => {
        try {

            const { name_foundation } = req.params

            if (!name_foundation) {
                return res.status(500).json({
                    message: 'Please send the name of foundation',
                    success: false
                })
            }

            /* Initializing the Moralis library. */
            await Moralis.start({ serverUrl, appId, masterKey });

            const Post = Moralis.Object.extend("Post");

            const query = new Moralis.Query(Post);

            query.equalTo("name_foundation", name_foundation);

            const results = await query.find();

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
    },
    
    getPostByFoundationWallet: async (req, res) => {
        try {

            const { ethAddress } = req.params

            if (!ethAddress) {
                return res.status(500).json({
                    message: 'Please send the ethAddress of foundation',
                    success: false
                })
            }

            /* Initializing the Moralis library. */
            await Moralis.start({ serverUrl, appId, masterKey });

            const Post = Moralis.Object.extend("Post");

            const query = new Moralis.Query(Post);

            query.equalTo("ethAddress", ethAddress);

            const results = await query.find();

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

module.exports = postController