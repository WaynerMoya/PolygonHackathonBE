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

        /* Returning the IPFS hash of the file. */
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
        /* Returning a new error object with the message "error". */
        return new Error(error);
    }
}

/* Exporting the functions `uploadImage` and `uploadMetaData` so that they can be used in other files. */
module.exports = {
    uploadImage,
    uploadMetaData
}