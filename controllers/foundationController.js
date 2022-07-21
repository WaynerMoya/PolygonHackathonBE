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

            /* Initializing the Moralis library. */
            await Moralis.start({ serverUrl, appId, masterKey });

            const { name, email, country, description, image } = req.body

            if (!name || !email || !country || !description || !image) {
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

    }
}

module.exports = foundationController