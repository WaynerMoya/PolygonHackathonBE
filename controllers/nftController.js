/* Importing the Moralis library. */
const Moralis = require("moralis/node");

/* This is how you can use environment variables in Node.js. */
const serverUrl = process.env.MORALIS_SERVER_URL
const appId = process.env.MORALIS_API_ID
const masterKey = process.env.MORALIS_MASTER_KEY

/* Importing the Node.js file system library. */
const fs = require("fs");

/* Importing the axios library. */
const axios = require('axios');

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

/**
 * It takes a name, description, and image, and returns the IPFS hash of the metadata
 * @param name - The name of the file
 * @param description - The description of the file.
 * @param image - The image file to be uploaded.
 * @returns The IPFS hash of the file.
 */
const uploadMetaData = async (name, description, image) => {

    try {

        /* Creating a JSON object with the name, description, and image. */
        const metadata = {
            name: name,
            description: description,
            animation_url: image
        }

        /* Creating a new Moralis File object with the metadata. */
        const file = new Moralis.File(`${name}_collection.json`, {
            base64: Buffer.from(JSON.stringify(metadata)).toString("base64")
        });

        /* Uploading the file to IPFS. */
        await file.saveIPFS({ useMasterKey: true })

        /* Returning the IPFS hash of the file. */
        return file.ipfs();

    } catch (error) {
        return new Error(error);
    }

}

/* Creating a new object called `nftController` with a function called `createNft`. */
const nftController = {

    /* 
const collection = [
    {
        "name" : "xxxxxxx",
        "description" : "xxxxxxx"
        "images" : [
            {
                "id" : "1",
                "url" : "http:///xxxxxxx"
            },
            {
                "id" : "2",
                "url" : "http:///xxxxxxx"
            },
            {
                "id" : "3",
                "url" : "http:///xxxxxxx"
            }
        ]
    },
    {
        "name" : "yyyyy",
        "description" : "yyyyy"
        "images" : [
            {
                "id" : "1",
                "url" : "http:///yyyyy"
            },
            {
                "id" : "2",
                "url" : "http:///yyyyy"
            },
            {
                "id" : "3",
                "url" : "http:///yyyyy"
            }
        ]
    },
]

*/

    /* This is the `createNft` function. It takes in a `req` and `res` object, and returns a JSON
    object with the message, metadata, and image. */
    createNft: async (req, res) => {
        /* This is a try/catch block. It is used to catch errors that may occur in the code. */

        try {

            /* Initializing the Moralis library. */
            await Moralis.start({ serverUrl, appId, masterKey });

            /* Destructuring the `req.body` object and assigning it to the `collection` variable. */
            const { collection } = req.body
            /* Creating an empty array. */
            let result = []
            // let arrFiles = req.files.files;
            
            // return res.status(200).json({
            //     message: arrFiles[0].name,
            //     success: false
            // })
            for (let x = 0; x < collection.length; x++) {

                /* Uploading the image to IPFS. */
                const image = await uploadImage(collection[x].file, collection[x].name)

                /* Checking if the `image` variable is an instance of the `Error` class. If it is, it
                   returns a JSON object with the message and success. */
                if (image instanceof Error) {
                    return res.status(400).json({
                        message: image?.message,
                        success: false
                    })
                }

                /* Calling the `uploadMetaData` function and passing in the `name`, `description`, and
                `image` variables. */
                const metadata = await uploadMetaData(collection[x].name, collection[x].description, image);

                /* Checking if the `metadata` variable is an instance of the `Error` class. If it is, it
                returns a JSON object with the message and success. */
                if (metadata instanceof Error) {
                    return res.status(400).json({
                        message: metadata?.message,
                        success: false
                    })
                }

                /* Pushing the metadata and images into the result array. */
                result.push({
                    "metadata": metadata,
                    animation_url: image
                })
            }

            /* Returning a JSON object with the message, success, and collection. */
            return res.status(201).json({
                message: 'Collection created successfully',
                success: true,
                collection: result
            })

        } catch (error) {
            /* Returning a JSON object with the message and success. */
            return res.status(500).json({
                message: error?.message,
                success: false
            })
        }
    },
    /* This is a function that takes in a `req` and `res` object, and returns the file from IPFS. */
    getFileNft: async (req, res) => {

        /* This is a function that takes in a `req` and `res` object, and returns the file from IPFS. */
        try {

            /* Destructuring the `req.body` object and assigning it to the `ipfsHash` variable. */
            const { ipfsHash } = req.body || req.params;

            /* Creating a URL to the IPFS file. */
            /* "https://ipfs.moralis.io:2053/ipfs/QmNtScDBrnS2TfHTaLMWqMRsgqWaYZYYiRhEkXL571uvkk" to 
                QmNtScDBrnS2TfHTaLMWqMRsgqWaYZYYiRhEkXL571uvkk
            */
            const url = `https://gateway.moralisipfs.com/ipfs/${ipfsHash}`

            /* Making a request to the IPFS gateway to get the file. */
            const response = await axios.get(url);

            /* Checking if the response from the IPFS gateway is empty. If it is, it returns a JSON
            object with the message and success. */
            if (!response) {
                /* Returning a JSON object with the message and success. */
                return res.status(400).json({
                    message: "File not found",
                    success: false
                })
            }

            /* Returning a JSON object with the message, data, and success. */
            return res.status(200).json({
                message: "File retrieved successfully",
                data: response?.data,
                success: true
            });

        } catch (error) {

            /* Returning a JSON object with the message and success. */
            return res.status(500).json({
                message: 'Error getting NFT',
                success: false
            })
        }
    }
}

/* Exporting the `nftController` object so that it can be imported in other files. */
module.exports = nftController