/* Importing the Moralis library. */
const Moralis = require("moralis/node");

const causeController = {

    getStepByAddress: async (req, res) => {
        try {

            const { wallet } = req.params

            const Step = Moralis.Object.extend("Step");

            const query = new Moralis.Query(Step);

            query.equalTo("ethAddress", wallet);

            const results = await query.first();

            if (!results) {

                return res.status(200).json({
                    message: 'Steps not founded',
                    success: false
                })
            }

            return res.status(200).json({
                message: 'steps searched successfully',
                steps: results,
                success: true
            })

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message || 'Error to get steps by cause'
            })

        }
    }

}

module.exports = causeController