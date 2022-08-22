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

const foundationController = {

    /* This function is creating a new foundation in the database. */
    createFoundation: async (req, res) => {
        try {

            /* Destructuring the `req.body` object. */
            const { name, email, country, description, image, ethAddress } = req.body

            /* Checking if all the fields are sent. */
            if (!name || !email || !country || !description || !image || !ethAddress) {
                return res.status(500).json({
                    message: 'please validate that all fields are sent'
                })
            }

            /* Uploading the image to IPFS and returning the IPFS hash. */
            const imageInIpfs = await uploadImage(image, name)

            if (imageInIpfs instanceof Error) {

                return res.status(400).json({
                    message: imageInIpfs?.message,
                    success: false
                })
            }

            /* This is creating a new foundation object in the database. */
            const Foundation = Moralis.Object.extend("Foundation");

            const foundation = new Foundation();

            /* Setting the values of the foundation object. */
            foundation.set("name", name);
            foundation.set("email", email);
            foundation.set("country", country);
            foundation.set("description", description);
            foundation.set("image", imageInIpfs);
            foundation.set("ethAddress", ethAddress);

            /* Saving the foundation object in the database. */
            await foundation.save()

            /* Checking if there is an error in the foundation object. */
            if (foundation?.error) {
                return res.status(400).json({
                    message: foundation?.error,
                    success: false
                })
            }

           /* Returning a JSON object with the message, the success, and the foundation. */
            return res.status(201).json({
                message: 'Create foundation successfully',
                success: true,
                foundation
            })


        } catch (error) {

            /* Returning a JSON object with the message and success. */
            return res.status(500).json({
                message: error?.message,
                success: false
            })

        }
    },
    /* This function is getting all the foundations in the database. */
    getFoundations: async (req, res) => {
        try {

            /* Creating a new class in the database. */
            const Foundation = Moralis.Object.extend("Foundation");

            /* Creating a new query to the database. */
            const query = new Moralis.Query(Foundation);

            /* Sorting the results by the date they were created. */
            query.descending('_created_at')

            /* Getting all the foundations in the database. */
            const results = await query.find();

            /* This is checking if the result is empty. If it is empty, it is returning a JSON object
            with the message and success. */
            if (!results) {
                return res.status(404).json({
                    message: 'Error to get foundations',
                    success: false
                })
            }

            /* Returning a JSON object with the message, the foundations, and the success. */
            return res.status(200).json({
                message: 'foundations searched successfully',
                foundations: results,
                success: true
            })

        } catch (error) {

            /* Returning a JSON object with the message and success. */
            return res.status(500).json({
                message: error?.message || 'Error to get foundations',
                success: false
            })

        }
    },
    /* This function is getting a foundation by email. */
    getFoundationByEmail: async (req, res) => {
        try {

            /* Destructuring the `req.params` object and getting the `email` property. */
            const { email } = req.params

            /* Creating a new class in the database. */
            const Foundation = Moralis.Object.extend("Foundation");

            /* This is a query to the database. */
            const query = new Moralis.Query(Foundation);

            query.equalTo("email", email);

            const result = await query.find();

            /* This is checking if the result is empty. If it is empty, it is returning a JSON object
                        with the message and success. */
            if (result?.length === 0) {
                return res.status(404).json({
                    message: 'Error to get foundation profile',
                    success: false
                })
            }

            /* Returning a JSON object with the message, the foundation, and the success. */
            return res.status(200).json({
                message: 'foundation profile searched successfully',
                foundation: result
            })

        } catch (error) {

            /* Returning a JSON object with the message and success. */
            return res.status(500).json({
                message: error?.message || 'Error to get foundation by email',
                success: false
            })

        }
    },
    /* This function is getting a foundation by wallet. */
    getFoundationByWallet: async (req, res) => {
        try {

            /* Destructuring the `req.params` object and getting the `wallet` property. */
            const { wallet } = req.params

            /* Creating a new class in the database. */
            const Foundation = Moralis.Object.extend("Foundation");

            /* This is a query to the database. */
            const query = new Moralis.Query(Foundation);

            query.equalTo("ethAddress", wallet);

            const result = await query.first();

            /* This is checking if the result is empty. If it is empty, it is returning a JSON object
            with the message and success. */
            if (!result) {
                return res.status(400).json({
                    message: 'Error to get foundation profile',
                    success: false
                })
            }

            /* Returning a JSON object with the message, the foundation, and the success. */
            return res.status(200).json({
                message: 'foundation profile searched successfully',
                foundation: result,
                success: true
            })

        } catch (error) {

            /* Returning a JSON object with the message and success. */
            return res.status(500).json({
                message: error?.message || 'Error to get foundation by wallet',
                success: false
            })

        }
    }
}

/* Exporting the `foundationController` object so that it can be imported in other files. */
module.exports = foundationController