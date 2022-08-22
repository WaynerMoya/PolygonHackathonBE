/* Importing the Moralis library. */
const Moralis = require("moralis/node");

const causeController = {

    /* This function is responsible for getting the steps of a cause by the wallet address. */
    getStepByAddress: async (req, res) => {
        try {

            /* Destructuring the wallet from the request params. */
            const { wallet } = req.params

            /* Creating a new class called Step. */
            const Step = Moralis.Object.extend("Step");

            const query = new Moralis.Query(Step);

            /* Searching for the steps that have the same wallet address as the one that was passed in the request. */
            query.equalTo("ethAddress", wallet);

            /* Getting the first result of the query. */
            const results = await query.first();

            /* This is a conditional statement that checks if the results are empty. If they are, it
            returns a message saying that the steps were not found. */
            if (!results) {

                return res.status(200).json({
                    message: 'Steps not founded',
                    success: false
                })
            }

            /* This is a conditional statement that checks if the results are empty. If they are, it
                        returns a message saying that the steps were not found. */
            return res.status(200).json({
                message: 'steps searched successfully',
                steps: results,
                success: true
            })

        } catch (error) {

            /* This is a conditional statement that checks if the results are empty. If they are, it
                                    returns a message saying that the steps were not found. */
            return res.status(500).json({
                success: false,
                message: error.message || 'Error to get steps by cause'
            })

        }
    }

}

module.exports = causeController