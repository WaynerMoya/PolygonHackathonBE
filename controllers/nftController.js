/* Importing the Moralis library. */
const Moralis = require("moralis/node");
const fetch = require('node-fetch');
const { ethers  } = require('ethers');
const abiMarketPlace = require('../assets/json/abiMartketPlace.json');
/* This is how you can use environment variables in Node.js. */
const chainMoralis = process.env.MORALIS_CHAIN

const getParametersNameAndValue = require("../global/ssm-parameters")


/* Importing the Node.js file system library. */
const fs = require("fs");


const consultTable = async (table, paramValue) => {
    const Table = Moralis.Object.extend(table);
  
    const query = new Moralis.Query(Table);
  
    query.equalTo('nftContract', paramValue);
  
    const result = await query.first();
    return result;
  };
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
        /* Returning a new error object with the message "error". */
        return new Error(error);
    }
}

/* Creating a new object called `nftController` with a function called `createNft`. */
const nftController = {

    createOneNFT: async (req, res) => {

        try {

            const { name, description, file } = req.body

            if (!name || !description || !file) {
                return res.status(500).json({
                    success: false,
                    message: 'Missing parameters'
                })
            }

            /* Uploading the image to IPFS. */
            const image = await uploadImage(file, name)

            if (image instanceof Error) {
                return res.status(400).json({
                    message: image?.message,
                    success: false
                })
            }

            const metadata = await uploadMetaData(name, description, image);

            if (metadata instanceof Error) {
                return res.status(400).json({
                    message: metadata?.message,
                    success: false
                })
            }

            /* Returning a JSON object with the message, success, and collection. */
            res.status(201).json({
                message: 'Collection created successfully',
                success: true,
                nft: metadata
            })

        } catch (error) {

            res.status(500).json({
                success: false,
                message: error?.message || 'Something fall'
            })
        }
    },

    /* This is the `createNft` function. It takes in a `req` and `res` object, and returns a JSON
    object with the message, metadata, and image. */
    createCollectionNfts: async (req, res) => {
        /* This is a try/catch block. It is used to catch errors that may occur in the code. */

        try {

            const params = await getParametersNameAndValue()

            /* Initializing the Moralis library. */
            await Moralis.start({
                serverUrl: params['moralis-server-url'].value,
                appId: params['moralis-api-id'].value,
                masterKey: params['moralis-master-key'].value
            });

            /* Destructuring the `req.body` object and assigning it to the `collection` variable. */
            const { collection } = req.body
            /* Creating an empty array. */
            let result = []

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
    /* The above code is getting the NFT owners. */
    getNFTOwners: async (req, res) => {
        try {

            const params = await getParametersNameAndValue()

            /* Initializing the Moralis library. */
            await Moralis.start({
                serverUrl: params['moralis-server-url'].value,
                appId: params['moralis-api-id'].value,
                masterKey: params['moralis-master-key'].value
            });

            /* Destructuring the address property from the req.body object. */
            const { address } = req.body

            /* Creating an object called options. */
            const options = {
                /* (required): Address of the contract */
                address: address,
                /* (optional): The blockchain to get data from */
                chain: chainMoralis
            };

            /* The above code is getting the NFT owners. */
            const nftOwners = await Moralis.Web3API.token.getNFTOwners(options);

            if (nftOwners.error || nftOwners.message || !nftOwners) {
                return res.status(400).json({
                    message: 'Error to get nft owners',
                    success: false,
                    nftOwners: nftOwners
                })
            }

            /* The above code is searching for the NFT owners. */
            return res.status(200).json({
                message: 'NFT searched successfully',
                success: true,
                nftOwners: nftOwners
            })


        } catch (error) {

            /* Returning a JSON object with the message and success. */
            return res.status(500).json({
                message: error?.message || 'Error to get ntf owners',
                success: false
            })
        }
    },
    /* The above code is searching for NFTs. */
    searchNFTs: async (req, res) => {
        try {

            const params = await getParametersNameAndValue()

            /* Initializing the Moralis library. */
            await Moralis.start({
                serverUrl: params['moralis-server-url'].value,
                appId: params['moralis-api-id'].value,
                masterKey: params['moralis-master-key'].value
            });

            /* Destructuring the req.body object. */
            const { value, filter } = req.body

            /* The above code is creating an object called options. This object is used to pass in the
            search parameters to the search function. */
            const options = {
                /* (required): The search string parameter */
                q: value,
                /* (optional): The blockchain to get data from. */
                chain: chainMoralis,
                /* (required): What fields the search should match on. To look into the 
                entire metadata set the value to global. To have a better response time you 
                can look into a specific field like name. Available values : name; description; 
                attributes; global; name,description; name,attributes; description,attributes; 
                name,description,attributes */
                filter: filter
            };

            /* Searching for NFTs. */
            const NFTs = await Moralis.Web3API.token.searchNFTs(options);

            /* Checking for errors and returning a message if there is an error. */
            if (NFTs.error || NFTs.message || !NFTs) {
                return res.status(400).json({
                    message: 'Error searching NFTs',
                    success: false,
                    NFTs: NFTs
                })
            }

            /* Returning a JSON object with the message, success, and collection. */
            return res.status(201).json({
                message: 'NFTs searched successfully',
                success: true,
                NFTs: NFTs
            })

        } catch (error) {
            /* Returning a JSON object with the message and success. */
            return res.status(500).json({
                message: error?.message,
                success: false
            })
        }
    },
    /* The above code is getting the NFTs for a contract. */
    getNFTsForContract: async (req, res) => {
        try {

            const params = await getParametersNameAndValue()

            /* Initializing the Moralis library. */
            await Moralis.start({
                serverUrl: params['moralis-server-url'].value,
                appId: params['moralis-api-id'].value,
                masterKey: params['moralis-master-key'].value
            });

            /* Destructuring the address and token_address from the request body. */
            const { address, token_address } = req.body

            /* Creating an object called options. */
            const options = {
                /* (optional) The blockchain to get data from. */
                chain: chainMoralis,
                /* (required): Address of the contract */
                token_address: token_address,
            };

            if (address !== undefined || address !== null) {
                /* (optional): The owner of a given token (i.e. 0x1a2b3x...). If specified, the user 
                attached to the query is ignored and the address will be used instead */
                options.address = address
            }

            /* Getting the NFTs for the contract. */
            const polygonNFTs = await Moralis.Web3API.account.getNFTsForContract(options);

            if (polygonNFTs.error || polygonNFTs.message || !polygonNFTs) {
                return res.status(400).json({
                    message: 'Error searching polygonNFTs',
                    success: false,
                    polygonNFTs: polygonNFTs
                })
            }

            /* Returning a JSON object with the message, success, and collection. */
            return res.status(201).json({
                message: 'polygonNFTs searched successfully',
                success: true,
                polygonNFTs: polygonNFTs
            })

        } catch (error) {
            /* Returning a JSON object with the message and success. */
            return res.status(500).json({
                message: error?.message,
                success: false
            })
        }
    },
    /* The above code is getting the lowest price of a NFT. */
    getNFTLowestPrice: async (req, res) => {
        try {

            const params = await getParametersNameAndValue()

            /* Initializing the Moralis library. */
            await Moralis.start({
                serverUrl: params['moralis-server-url'].value,
                appId: params['moralis-api-id'].value,
                masterKey: params['moralis-master-key'].value
            });

            /* Destructuring the request body. */
            const { address, days = 7 } = req.body

            /* The above code is creating an object called options. The object has two properties,
            address and days. The address property is the address of the contract. The days property
            is the number of days to look back to find the lowest price. */
            const options = {
                /* (required): Address of the contract(i.e. 0x1a2b3x...). */
                address: address,
                /* (optional)The number of days to look back to find the lowest price If not provided 
                7 days will be the default*/
                days: days,
            };

            /* Getting the lowest price of a NFT. */
            const NFTLowestPrice = await Moralis.Web3API.token.getNFTLowestPrice(options);

            /* Checking for errors and returning a message if there is an error. */
            if (NFTLowestPrice.error || NFTLowestPrice.message || !NFTLowestPrice) {
                return res.status(400).json({
                    message: 'Error searching getNFTLowestPrice',
                    success: false,
                    NFTLowestPrice: NFTLowestPrice
                })
            }

            /* Returning a JSON object with the message, success, and collection. */
            return res.status(201).json({
                message: 'NFTLowestPrice searched getNFTLowestPrice',
                success: true,
                NFTLowestPrice: NFTLowestPrice
            })

        } catch (error) {
            /* Returning a JSON object with the message and success. */
            return res.status(500).json({
                message: error?.message,
                success: false
            })
        }
    },
    getNewestNFTs: async (req, res) => {
        try {

            const params = await getParametersNameAndValue()

            const NewestNFT = Moralis.Object.extend("NewestNFT");

            const queryNewestNFT = new Moralis.Query(NewestNFT);

            // Retrieve the most recent ones
            queryNewestNFT.descending("createdAt");

            // Only retrieve the last ten
            queryNewestNFT.limit(12);

            const pipelineNewestAndCauses = [
                {
                    lookup:
                    {
                        from: 'Causes',
                        localField: 'nftContract',
                        foreignField: 'contractAddress',
                        as: 'ethAddress'
                    },
                },
                {
                    lookup:
                    {
                        from: 'Foundation',
                        localField: 'ethAddress.nftArtist',
                        foreignField: 'ethAddress',
                        as: 'ethAddress2'
                    }
                }
            ]

            const resultNewestNFTsAndCauses = await queryNewestNFT.aggregate(pipelineNewestAndCauses);

            // ----

            if (!resultNewestNFTsAndCauses) {
                return res.status(404).json({
                    message: 'Error to get causes',
                    success: false
                })
            }

            const provider = new ethers.providers.JsonRpcProvider('https://rpc-mumbai.maticvigil.com/');

            const signer = new ethers.Wallet(
                params['metamask-private-key'].value,
                provider
             );

            for (let i = 0; i < resultNewestNFTsAndCauses.length; i++) {
                resultNewestNFTsAndCauses[i].tokenId = resultNewestNFTsAndCauses[i].uid;
                let urlArr = resultNewestNFTsAndCauses[i].tokenUri.split("/");
                let ipfsHash = urlArr[urlArr.length - 1];
                let url = `https://gateway.moralisipfs.com/ipfs/${ipfsHash}`;
                let response = await fetch(url);
                let jsonToAdd = await response.json();

                resultNewestNFTsAndCauses[i].img = jsonToAdd.animation_url;

                resultNewestNFTsAndCauses[i].title = jsonToAdd.name;

                resultNewestNFTsAndCauses[i].price = 0;

                resultNewestNFTsAndCauses[i].status = false;
                resultNewestNFTsAndCauses[i].address = resultNewestNFTsAndCauses[i].nftContract;



                resultNewestNFTsAndCauses[i].logo_foundation = resultNewestNFTsAndCauses[i].ethAddress2[0].image;
                resultNewestNFTsAndCauses[i].name_foundation = resultNewestNFTsAndCauses[i].ethAddress2[0].name;
                const market = await consultTable(
                    "CauseMarket",
                    resultNewestNFTsAndCauses[i].nftContract
                  );
                
                if(market){ 
                    resultNewestNFTsAndCauses[i].marketAddress = market.get("marketplaceAddress");
                }

                const contract = new ethers.Contract(resultNewestNFTsAndCauses[i].marketAddress, abiMarketPlace, signer);

                const status = await contract.callStatic.getListing(resultNewestNFTsAndCauses[i].address, resultNewestNFTsAndCauses[i].tokenId)
                
                resultNewestNFTsAndCauses[i].status = false;
                resultNewestNFTsAndCauses[i].price = 0;
                if (status["seller"] && status["seller"] !== '0x0000000000000000000000000000000000000000') {
                  resultNewestNFTsAndCauses[i].status = true;
                  resultNewestNFTsAndCauses[i].price = parseFloat(Moralis.Units.FromWei(status["price"]));
                }
            }


            res.status(200).json({
                success: true,
                message: 'Get newest NFTs successfully',
                nfts: resultNewestNFTsAndCauses
            })

        } catch (error) {
            /* Returning a JSON object with the message and success. */
            return res.status(500).json({
                message: error?.message,
                success: false
            })
        }
    },
    getNFTsFromCause: async (req, res) => {

        try {

            const { address } = req.params

            if (!address) {
                return res.status(500).json({
                    success: false,
                    message: 'Missing parameter'
                })
            }

            const NewestNFT = Moralis.Object.extend("NewestNFT");

            const queryNewestNFT = new Moralis.Query(NewestNFT);

            // Retrieve the most recent ones
            queryNewestNFT.descending("createdAt");

            // Only retrieve the last ten
            queryNewestNFT.equalTo('nftContract', address);

            const pipelineNewestAndCauses = [
                {
                    lookup:
                    {
                        from: 'Causes',
                        localField: 'nftContract',
                        foreignField: 'contractAddress',
                        as: 'ethAddress'
                    },
                },
                {
                    lookup:
                    {
                        from: 'Foundation',
                        localField: 'ethAddress.nftArtist',
                        foreignField: 'ethAddress',
                        as: 'ethAddress2'
                    }
                }
            ]

            const resultNewestNFTsAndCauses = await queryNewestNFT.aggregate(pipelineNewestAndCauses);


            const market = await consultTable(
                "CauseMarket",
                address
              );

            const marketAddress = market.get("marketplaceAddress");

            const params = await getParametersNameAndValue()
            const provider = new ethers.providers.JsonRpcProvider('https://rpc-mumbai.maticvigil.com/');

            const signer = new ethers.Wallet(
                params['metamask-private-key'].value,
                provider
             );

            for (let i = 0; i < resultNewestNFTsAndCauses.length; i++) {



                resultNewestNFTsAndCauses[i].tokenId = resultNewestNFTsAndCauses[i].uid;

                let urlArr = resultNewestNFTsAndCauses[i].tokenUri.split("/");
                let ipfsHash = urlArr[urlArr.length - 1];
                let url = `https://gateway.moralisipfs.com/ipfs/${ipfsHash}`;
                let response = await fetch(url);
                let jsonToAdd = await response.json();

                resultNewestNFTsAndCauses[i].img = jsonToAdd.animation_url;

                resultNewestNFTsAndCauses[i].title = jsonToAdd.name;

                resultNewestNFTsAndCauses[i].price = 1;

                resultNewestNFTsAndCauses[i].status = true;
                resultNewestNFTsAndCauses[i].address = resultNewestNFTsAndCauses[i].nftContract;


                resultNewestNFTsAndCauses[i].logo_foundation = resultNewestNFTsAndCauses[i].ethAddress2[0].image;
                resultNewestNFTsAndCauses[i].name_foundation = resultNewestNFTsAndCauses[i].ethAddress2[0].name;

                const market = await consultTable(
                    "CauseMarket",
                    resultNewestNFTsAndCauses[i].nftContract
                  );
                
                if(market){ 
                    resultNewestNFTsAndCauses[i].marketAddress = market.get("marketplaceAddress");
                }
                
                const contract = new ethers.Contract(resultNewestNFTsAndCauses[i].marketAddress, abiMarketPlace, signer);

                const status = await contract.callStatic.getListing(resultNewestNFTsAndCauses[i].address, resultNewestNFTsAndCauses[i].tokenId)
                
                resultNewestNFTsAndCauses[i].status = false;
                resultNewestNFTsAndCauses[i].price = 0;
                if (status["seller"] && status["seller"] !== '0x0000000000000000000000000000000000000000') {
                  resultNewestNFTsAndCauses[i].status = true;
                  resultNewestNFTsAndCauses[i].price = parseFloat(Moralis.Units.FromWei(status["price"]));
                }
            }


            if (!resultNewestNFTsAndCauses) {
                return res.status(404).json({
                    message: 'Error to get causes',
                    success: false
                })
            }

            res.status(200).json({
                success: true,
                message: 'Get NFTs from cause successfully',
                nfts: resultNewestNFTsAndCauses,
                marketAddress
            })

        } catch (error) {
            /* Returning a JSON object with the message and success. */
            return res.status(500).json({
                message: error?.message,
                success: false
            })
        }

    },

    getNFTsFromAddressAndTokenId: async (req, res) => {

        try {

            const { address, id } = req.params

            if (!address || !id) {
                return res.status(500).json({
                    success: false,
                    message: 'Missing parameter'
                })
            }

          
            const NewestNFT = Moralis.Object.extend("NewestNFT");

            const queryNewestNFT = new Moralis.Query(NewestNFT);

            // Retrieve the most recent ones
            queryNewestNFT.descending("createdAt");

            // Only retrieve the last ten
            queryNewestNFT.equalTo('nftContract', address);
            queryNewestNFT.equalTo('uid', id);

            const pipelineNewestAndCauses = [
                {
                    lookup:
                    {
                        from: 'Causes',
                        localField: 'nftContract',
                        foreignField: 'contractAddress',
                        as: 'ethAddress'
                    },
                },
                {
                    lookup:
                    {
                        from: 'Foundation',
                        localField: 'ethAddress.nftArtist',
                        foreignField: 'ethAddress',
                        as: 'ethAddress2'
                    }
                }
            ]

            const resultNewestNFTsAndCauses = await queryNewestNFT.aggregate(pipelineNewestAndCauses);

            const params = await getParametersNameAndValue()
            const provider = new ethers.providers.JsonRpcProvider('https://rpc-mumbai.maticvigil.com/');

            const signer = new ethers.Wallet(
                params['metamask-private-key'].value,
                provider
             );
             
            const market = await consultTable(
                "CauseMarket",
                address
              );

            const marketAddress = market.get("marketplaceAddress");

            const results = resultNewestNFTsAndCauses[0];



            if (results) {
               
                results.owned =  `${results.owner.slice(0, 2)}...${results.owner.slice(results.owner.length - 4)}`
                let urlArr = results.tokenUri.split("/");
                let ipfsHash = urlArr[urlArr.length - 1];
                let url = `https://gateway.moralisipfs.com/ipfs/${ipfsHash}`;
                let response = await fetch(url);
                let jsonToAdd = await response.json();
                results.description = jsonToAdd.description;
                results.tokenId = id;
                results.img = jsonToAdd.animation_url;
                results.title = jsonToAdd.name;
                results.price = 0;
                results.cause = results.ethAddress[0].title;

                const { image, name } = results.ethAddress2[0];

                results.logo_foundation = image;
                results.name_foundation = name;
                results.address = results.nftContract;
                results.status = true;
                results.itemsActivity = [];
                const market = await consultTable(
                    "CauseMarket",
                    results.nftContract
                  );
                
                if(market){ 
                    results.marketAddress = market.get("marketplaceAddress");
                }
                const contract = new ethers.Contract(results.marketAddress, abiMarketPlace, signer);

                const status = await contract.callStatic.getListing(results.address, results.tokenId)
                
                results.status = false;
                results.price = 0;
                if (status["seller"] && status["seller"] !== '0x0000000000000000000000000000000000000000') {
                  results.status = true;
                  results.price = parseFloat(Moralis.Units.FromWei(status["price"]));
                }
            }

            res.status(200).json({
                success: true,
                message: 'Get NFT from address and id successfully',
                nft: results,
                marketAddress
            })

        } catch (error) {
            return res.status(500).json({
                message: error?.message,
                success: false
            })
        }
    },
    getNFTsFromWallet: async (req, res) => {

        try {

            const { wallet } = req.params

            const NewestNFT = Moralis.Object.extend("NewestNFT");

            const queryNewestNFT = new Moralis.Query(NewestNFT);

            // Retrieve the most recent ones
            queryNewestNFT.descending("createdAt");

            // Only retrieve the last ten
            queryNewestNFT.equalTo('owner', wallet);

            const pipelineNewestAndCauses = [
                {
                    lookup:
                    {
                        from: 'Causes',
                        localField: 'nftContract',
                        foreignField: 'contractAddress',
                        as: 'ethAddress'
                    },
                },
                {
                    lookup:
                    {
                        from: 'Foundation',
                        localField: 'ethAddress.nftArtist',
                        foreignField: 'ethAddress',
                        as: 'ethAddress2'
                    }
                }
            ]

            const resultNewestNFTsAndCauses = await queryNewestNFT.aggregate(pipelineNewestAndCauses);


            if (!resultNewestNFTsAndCauses) {
                return res.status(404).json({
                    message: 'Error to get causes',
                    success: false
                })
            }


            for (let i = 0; i < resultNewestNFTsAndCauses.length; i++) {



                resultNewestNFTsAndCauses[i].tokenId = resultNewestNFTsAndCauses[i].uid;

                let urlArr = resultNewestNFTsAndCauses[i].tokenUri.split("/");
                let ipfsHash = urlArr[urlArr.length - 1];
                let url = `https://gateway.moralisipfs.com/ipfs/${ipfsHash}`;
                let response = await fetch(url);
                let jsonToAdd = await response.json();

                resultNewestNFTsAndCauses[i].img = jsonToAdd.animation_url;

                resultNewestNFTsAndCauses[i].title = jsonToAdd.name;

                resultNewestNFTsAndCauses[i].price = 0;

                resultNewestNFTsAndCauses[i].status = false;
                resultNewestNFTsAndCauses[i].address = resultNewestNFTsAndCauses[i].nftContract;



                resultNewestNFTsAndCauses[i].logo_foundation = resultNewestNFTsAndCauses[i].ethAddress2[0].image;
                resultNewestNFTsAndCauses[i].name_foundation = resultNewestNFTsAndCauses[i].ethAddress2[0].name;

                
                const market = await consultTable(
                    "CauseMarket",
                    resultNewestNFTsAndCauses[i].nftContract
                  );
                
                if(market){ 
                    resultNewestNFTsAndCauses[i].marketAddress = market.get("marketplaceAddress");
                }
            }


            res.status(200).json({
                success: true,
                message: 'Get NFTs from wallet successfully',
                nfts: resultNewestNFTsAndCauses
            })


        } catch (error) {
            /* Returning a JSON object with the message and success. */
            return res.status(500).json({
                message: error?.message,
                success: false
            })
        }
    },
    tradeNft: async (req, res) => {
        
        try {

            const { ethAddress, tokenId, address } = req.body

            if (!ethAddress || !tokenId || !address) {
                return res.status(200).json({
                    success: false,
                    message: 'Missing parameter'
                })
            }
            const NewestNFT = Moralis.Object.extend("NewestNFT");

            const queryNewestNFT = new Moralis.Query(NewestNFT);

            queryNewestNFT.equalTo('nftContract', address)
            queryNewestNFT.equalTo('uid', tokenId)

            const result = await queryNewestNFT.first();
            result.set('owner', ethAddress);
            result.save();
            

            res.status(200).json({
                success: true
            })


        } catch (error) {
            /* Returning a JSON object with the message and success. */
            return res.status(
                200
            ).json({
                success: false,
                error: error?.message,
            })
        }
    }
}

/* Exporting the `nftController` object so that it can be imported in other files. */
module.exports = nftController