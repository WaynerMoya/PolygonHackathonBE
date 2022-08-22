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

/**
 * It takes a name, description, and image, and returns the IPFS hash of the metadata
 * @param name - The name of the file
 * @param description - The description of the file.
 * @param image - The image file to be uploaded.
 * @returns The IPFS hash of the file.
 */


const foundationController = {

    createFoundation: async (req, res) => {
        try {

            const { name, email, country, description, image, ethAddress } = req.body

            if (!name || !email || !country || !description || !image || !ethAddress) {
                return res.status(500).json({
                    message: 'please validate that all fields are sent'
                })
            }

            const imageInIpfs = await uploadImage(image, name)

            if (imageInIpfs instanceof Error) {

                return res.status(400).json({
                    message: imageInIpfs?.message,
                    success: false
                })
            }

            const Foundation = Moralis.Object.extend("Foundation");

            const foundation = new Foundation();

            foundation.set("name", name);
            foundation.set("email", email);
            foundation.set("country", country);
            foundation.set("description", description);
            foundation.set("image", imageInIpfs);
            foundation.set("ethAddress", ethAddress);

            await foundation.save()

            if (foundation?.error) {
                return res.status(400).json({
                    message: foundation?.error,
                    success: false
                })
            }

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
    getFoundations: async (req, res) => {
        try {

            const Foundation = Moralis.Object.extend("Foundation");

            const query = new Moralis.Query(Foundation);

            query.descending('_created_at')

            const results = await query.find();

            if (!results) {
                return res.status(404).json({
                    message: 'Error to get foundations',
                    success: false
                })
            }

            return res.status(200).json({
                message: 'foundations searched successfully',
                foundations: results,
                success: true
            })

        } catch (error) {

            return res.status(500).json({
                message: error?.message || 'Error to get foundations',
                success: false
            })

        }
    },
    getFoundationByEmail: async (req, res) => {
        try {

            const { email } = req.params

            const Foundation = Moralis.Object.extend("Foundation");

            const query = new Moralis.Query(Foundation);

            query.equalTo("email", email);

            const result = await query.find();

            if (result?.length === 0) {
                return res.status(404).json({
                    message: 'Error to get foundation profile',
                    success: false
                })
            }

            return res.status(200).json({
                message: 'foundation profile searched successfully',
                foundation: result
            })

        } catch (error) {

            return res.status(500).json({
                message: error?.message || 'Error to get foundation by email',
                success: false
            })

        }
    },
    getFoundationByWallet: async (req, res) => {
        try {

            const { wallet } = req.params

            const Foundation = Moralis.Object.extend("Foundation");

            const query = new Moralis.Query(Foundation);

            query.equalTo("ethAddress", wallet);

            const result = await query.first();
            if (!result) {
                return res.status(200).json({
                    message: 'Error to get foundation profile',
                    success: false
                })
            }

            return res.status(200).json({
                message: 'foundation profile searched successfully',
                foundation: result,
                success: true
            })

        } catch (error) {

            return res.status(500).json({
                message: error?.message || 'Error to get foundation by wallet',
                success: false
            })

        }
    }
}

module.exports = foundationController