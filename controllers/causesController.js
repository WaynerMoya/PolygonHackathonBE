/* Importing the Moralis library. */
const Moralis = require("moralis/node");

const {
    uploadImage
} = require('../global/upload-data')

const causeController = {

    createCauseByWallet: async (req, res) => {

        try {

            const { wallet, image, title, goal, initialDate, duration } = req.body

            if (!wallet || !image || !title || !goal || !initialDate || !duration) {
                return res.status(500).json({
                    success: false,
                    message: 'Missing parameters'
                })
            }

            /* Uploading the image to IPFS. */
            const imageIPFS = await uploadImage(image, title)

            if (image instanceof Error) {
                return res.status(400).json({
                    message: image?.message,
                    success: false
                })
            }

            const Cause = Moralis.Object.extend("Cause");

            const cause = new Cause();

            cause.set("ethAddress", wallet);
            cause.set("image", imageIPFS);
            cause.set("title", title);
            cause.set("goal", goal);
            cause.set("initialDate", initialDate);
            cause.set("duration", duration);

            await cause.save()

            if (cause?.error) {

                return res.status(400).json({
                    message: cause?.error,
                    success: false
                })

            }

            return res.status(201).json({
                message: 'Create cause successfully',
                success: true,
                cause
            })

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message || 'Error to create cause by wallet'
            })
        }

    },
    getCauseByWallet: async (req, res) => {
        try {

            const { wallet } = req.params

            const Cause = Moralis.Object.extend("Causes");

            const query = new Moralis.Query(Cause);

            query.equalTo("nftArtist", wallet);

            const result = await query.find();
           
              
            if (!result) {
                return res.status(200).json({
                    message: 'Error to get cause',
                    success: false
                })
            }
            // const options = {
            //     chain: "mumbai",
            //     address: result.get('contractAddress')
            //   };
            // const balances = await Moralis.Web3API.account.getTokenBalances(options)
            return res.status(200).json({
                message: 'cause searched successfully',
                causes: result,
                success: true,
                // balances
            })

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message || 'Error to get cause by wallet'
            })

        }
    }

}

module.exports = causeController