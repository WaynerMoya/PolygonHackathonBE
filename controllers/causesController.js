/* Importing the Moralis library. */
const Moralis = require("moralis/node");

/* Importing the uploadImage function from the upload-data.js file. */
const { uploadImage } = require("../global/upload-data");

/**
 * It queries the Moralis database for a specific table, and returns the first result that matches the
 * query
 * @param table - The name of the table you want to query.
 * @param paramValue - The value of the parameter you want to search for.
 * @param [columnName=nftContract] - The column name to query.
 * @returns The first row of the table that matches the query.
 */
const consultTable = async (table, paramValue, columnName = 'nftContract') => {

  const Table = Moralis.Object.extend(table);

  const query = new Moralis.Query(Table);

  query.equalTo(columnName, paramValue);

  const result = await query.first();

  return result;
};

const causeController = {

  /* This function is creating a new cause in the Moralis database. */
  createCauseByWallet: async (req, res) => {
    try {

      /* Destructuring the request body. */
      const { wallet, image, title, goal, initialDate, duration } = req.body;

      /* This is checking if the request body has all the required parameters. */
      if (!wallet || !image || !title || !goal || !initialDate || !duration) {
        return res.status(500).json({
          success: false,
          message: "Missing parameters",
        });
      }

      /* Uploading the image to IPFS. */
      const imageIPFS = await uploadImage(image, title);

      /* This is checking if the uploadImage function returned an error. */
      if (image instanceof Error) {
        return res.status(400).json({
          message: image?.message,
          success: false,
        });
      }

      /* Creating a new class that extends the Moralis.Object class. */
      const Cause = Moralis.Object.extend("Cause");

      /* Creating a new instance of the Cause class. */
      const cause = new Cause();

      /* This is setting the values of the cause object. */
      cause.set("ethAddress", wallet);
      cause.set("image", imageIPFS);
      cause.set("title", title);
      cause.set("goal", goal);
      cause.set("initialDate", initialDate);
      cause.set("duration", duration);

      /* Saving the cause object in the Moralis database. */
      await cause.save();

      /* This is checking if the cause object has an error property. If it does, it returns a 400
      status code with the error message. */
      if (cause?.error) {
        return res.status(400).json({
          message: cause?.error,
          success: false,
        });
      }

      /* This is returning a 201 status code with a success message and the cause object. */
      return res.status(201).json({
        message: "Create cause successfully",
        success: true,
        cause,
      });

    } catch (error) {

      /* This is returning a 500 status code with a success message and the error message. */
      return res.status(500).json({
        success: false,
        message: error.message || "Error to create cause by wallet",
      });
    }
  },
  /* This function is querying the Moralis database for the Causes table, and returning the first
  result that matches the query. */
  getCauseByWallet: async (req, res) => {
    try {
      /* Destructuring the request parameters. */
      const { wallet } = req.params;

      /* Destructuring the request body. */
      const { ethAddress } = req.body;

      /* Creating a new class that extends the Moralis.Object class. */
      const Cause = Moralis.Object.extend("Causes");

      /* Creating a new instance of the Moralis.Query class. */
      const query = new Moralis.Query(Cause);

      /* Querying the Moralis database for the Causes table, and returning the first result that matches the
      query. */
      query.equalTo("nftArtist", wallet);

      /* Querying the Moralis database for the Causes table, and returning all the results that
      match the query. */
      let result = await query.find();

      /* This is a for loop that is iterating over the result array. */
      for (let i = result.length - 1; i >= 0; i--) {

        const { contractAddress } = result[i].attributes;

        /* Querying the Moralis database for the CauseTimeLock table, and returning the first result
        that matches the query. */
        const timeLock = await consultTable(
          "CauseTimeLock",
          contractAddress
        );

        /* This is checking if the timeLock variable is null. If it is, it is setting the
        timelockAddress, daoAddress, roleGranted, marketAddress, and proposalId properties of the
        result object to null. It is also checking if the ethAddress is not equal to the wallet. If
        it is not, it is removing the result object from the result array. */
        if (!timeLock) {
          result[i].set('timelockAddress', null);
          result[i].set('daoAddress', null);
          result[i].set('roleGranted', null);
          result[i].set('marketAddress', null);
          result[i].set('proposalId', null);
          if (ethAddress !== wallet) {
            result.splice(i, 1);
          }
          continue;
        }

        /* Setting the timelockAddress property of the result object to the value of the
        timelockAddress property of the timeLock object. */
        result[i].set('timelockAddress', timeLock.get("timelockAddress"));

        /* Querying the Moralis database for the CauseDao table, and returning the first result that matches
        the query. */
        const dao = await consultTable("CauseDao", contractAddress);

        /* This is checking if the dao variable is null. If it is, it is setting the daoAddress,
        marketAddress, roleGranted, and proposalId properties of the result object to null. It is
        also
        checking if the ethAddress is not equal to the wallet. If it is not, it is removing the
        result
        object from the result array. */
        if (!dao) {
          result[i].set('daoAddress', null);
          result[i].set('marketAddress', null);
          result[i].set('roleGranted', null);
          result[i].set('proposalId', null);
          if (ethAddress !== wallet) {
            result.splice(i, 1);
          }
          continue;
        }

        /* Setting the daoAddress property of the result object to the value of the daoAddress
        property of the dao object. */
        result[i].set('daoAddress', dao.get("daoAddress"));

        /* Querying the Moralis database for the CauseTimelockGranted table, and returning the first result
        that matches the query. */
        const roleGranted = await consultTable("CauseTimelockGranted", contractAddress);

        /* This is checking if the roleGranted variable is null. If it is, it is setting the
        marketAddress, roleGranted, and proposalId properties of the result object to null. It is
        also
        checking if the ethAddress is not equal to the wallet. If it is not, it is removing the
        result
        object from the result array. */
        if (!roleGranted) {
          result[i].set('marketAddress', null);
          result[i].set('roleGranted', null);
          result[i].set('proposalId', null);
          if (ethAddress !== wallet) {
            result.splice(i, 1);
          }
          continue;
        }

        /* Setting the roleGranted property of the result object to true. */
        result[i].set('roleGranted', true);

        /* Querying the Moralis database for the CauseMarket table, and returning the first result that
        matches the query. */
        const market = await consultTable(
          "CauseMarket",
          contractAddress
        );

        /* This is checking if the market variable is null. If it is, it is setting the marketAddress
        and
        proposalId properties of the result object to null. It is also checking if the ethAddress is
        not equal
        to the wallet. If it is not, it is removing the result object from the result array. */
        if (!market) {
          result[i].set('marketAddress', null);
          result[i].set('proposalId', null);
          if (ethAddress !== wallet) {
            result.splice(i, 1);
          }
          continue;
        }

        /* Setting the marketAddress property of the result object to the value of the
        marketplaceAddress property of the market object. */
        result[i].set('marketAddress', market.get("marketplaceAddress"));

        /* Querying the Moralis database for the CauseProposal table, and returning the first result that
        matches the query. */
        const proposal = await consultTable("CauseProposal", contractAddress, 'nftAddress');

        /* This is checking if the proposal variable is null. If it is, it is setting the proposalId
        property of the result object to null. */
        if (!proposal) {
          result[i].set('proposalId', null);
          continue;
        }

        /* Setting the proposalId property of the result object to the value of the proposalId
        property of the proposal object. */
        result[i].set('proposalId', proposal.get("proposalId"));
      }

      /* This is checking if the result variable is null. If it is, it is returning a 400 status code
      with a success message and the error message. */
      if (!result) {
        return res.status(400).json({
          message: "Error to get cause",
          success: false,
        });
      }

      /* Returning a 200 status code with a success message and the result array. */
      return res.status(200).json({
        message: "cause searched successfully",
        causes: result,
        success: true
        // balances
      });
    } catch (error) {
      /* This is returning a 500 status code with a success message and the error message. */
      return res.status(500).json({
        success: false,
        message: error.message || "Error to get cause by wallet",
      });
    }
  },
  /* This function is querying the Moralis database for the Steps table, and returning all the results
  that match the query. */
  getStepsByAddress: async (req, res) => {
    try {
      /* Destructuring the request parameters. */
      const { address } = req.params;

      /* Creating a new class that extends the Moralis.Object class. */
      const Steps = Moralis.Object.extend("Steps");

      /* Creating a new instance of the Moralis.Query class. */
      const query = new Moralis.Query(Steps);

      /* Querying the Moralis database for the Steps table, and returning all the results that match the
      query. */
      query.equalTo("contractAddress", address);

      /* Querying the Moralis database for the Steps table, and returning all the results that match the
      query. */
      const result = await query.find();

      /* This is checking if the result variable is null. If it is, it is returning a 400 status code
      with a success message and the error message. */
      if (!result) {
        return res.status(200).json({
          message: "Error to steps by address",
          success: false,
        });
      }

      /* This is returning a 200 status code with a success message and the result array. */
      return res.status(200).json({
        message: "steps searched successfully",
        steps: result,
        success: true,
        // balances
      });
    } catch (error) {
      /* This is returning a 500 status code with a success message and the error message. */
      return res.status(500).json({
        success: false,
        message: error.message || "Error to get cause by wallet",
      });
    }
  },
};

/* Exporting the causeController object. */
module.exports = causeController;
