/* Importing the Moralis library. */
const Moralis = require("moralis/node");

const { uploadImage } = require("../global/upload-data");

const consultTable = async (table, paramValue) => {
  const Table = Moralis.Object.extend(table);

  const query = new Moralis.Query(Table);

  query.equalTo('nftContract', paramValue);

  const result = await query.first();

  return result;
};

const causeController = {
  createCauseByWallet: async (req, res) => {
    try {
      const { wallet, image, title, goal, initialDate, duration } = req.body;

      if (!wallet || !image || !title || !goal || !initialDate || !duration) {
        return res.status(500).json({
          success: false,
          message: "Missing parameters",
        });
      }

      /* Uploading the image to IPFS. */
      const imageIPFS = await uploadImage(image, title);

      if (image instanceof Error) {
        return res.status(400).json({
          message: image?.message,
          success: false,
        });
      }

      const Cause = Moralis.Object.extend("Cause");

      const cause = new Cause();

      cause.set("ethAddress", wallet);
      cause.set("image", imageIPFS);
      cause.set("title", title);
      cause.set("goal", goal);
      cause.set("initialDate", initialDate);
      cause.set("duration", duration);

      await cause.save();

      if (cause?.error) {
        return res.status(400).json({
          message: cause?.error,
          success: false,
        });
      }

      return res.status(201).json({
        message: "Create cause successfully",
        success: true,
        cause,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Error to create cause by wallet",
      });
    }
  },
  getCauseByWallet: async (req, res) => {
    try {
      const { wallet } = req.params;

      const { ethAddress } = req.body;

      const Cause = Moralis.Object.extend("Causes");

      const query = new Moralis.Query(Cause);

      query.equalTo("nftArtist", wallet);

      let result = await query.find();

      for (let i = result.length - 1; i >= 0; i--) {
        // TimeLock -> CauseTimeLock

        // Dao -> CauseDao

        // Market -> CauseMarket

        const { contractAddress } = result[i].attributes;

        const timeLock = await consultTable(
          "CauseTimeLock",
          contractAddress
        );
        if (!timeLock) {
          result[i].set('timelockAddress' , null );
          result[i].set('daoAddress' , null );
          result[i].set('roleGranted' , null );
          result[i].set('marketAddress' , null );
          if (ethAddress !== wallet) {
            result.splice(i, 1);
          }
          continue;
        }

        result[i].set('timelockAddress', timeLock.get("timelockAddress"));

        const dao = await consultTable("CauseDao", contractAddress);

        if (!dao) {
          result[i].set('daoAddress', null);
          result[i].set('marketAddress', null);
          result[i].set('roleGranted' , null );
          if (ethAddress !== wallet) {
            result.splice(i, 1);
          }
          continue;
        }

        result[i].set('daoAddress', dao.get("daoAddress"));

        const roleGranted = await consultTable("CauseTimelockGranted", contractAddress);

        if (!roleGranted) {
            result[i].set('marketAddress', null);
            result[i].set('roleGranted' , null );
            if (ethAddress !== wallet) {
              result.splice(i, 1);
            }
            continue;
          }

        result[i].set('roleGranted', true);

        const market = await consultTable(
          "CauseMarket",
          contractAddress
        );

        if (!market) {
          result[i].set('marketAddress' , null);
          if (ethAddress !== wallet) {
            result.splice(i, 1);
          }
          continue;
        }

        result[i].set('marketAddress', market.get("marketplaceAddress"));
      }

      if (!result) {
        return res.status(200).json({
          message: "Error to get cause",
          success: false,
        });
      }

      // const options = {
      //     chain: "mumbai",
      //     address: result.get('contractAddress')
      //   };
      // const balances = await Moralis.Web3API.account.getTokenBalances(options)
      return res.status(200).json({
        message: "cause searched successfully",
        causes: result,
        success: true,
        // balances
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Error to get cause by wallet",
      });
    }
  },
  getStepsByAddress: async (req, res) => {
    try {
      const { address } = req.params;

      const Steps = Moralis.Object.extend("Steps");

      const query = new Moralis.Query(Steps);

      query.equalTo("contractAddress", address);

      const result = await query.find();

      if (!result) {
        return res.status(200).json({
          message: "Error to get cause",
          success: false,
        });
      }
      return res.status(200).json({
        message: "cause searched successfully",
        steps: result,
        success: true,
        // balances
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Error to get cause by wallet",
      });
    }
  },
};

module.exports = causeController;
