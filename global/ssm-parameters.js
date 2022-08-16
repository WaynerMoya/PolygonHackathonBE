/* Importing the AWS SDK for JavaScript. */
const AWS = require('aws-sdk')

/* Setting the region to us-east-2 */
AWS.config.update({
    region: 'us-east-2'
})

/* Creating a new instance of the AWS.SSM class. */
const parameterStore = new AWS.SSM()

/**
 * It takes a path and returns a promise that resolves to the parameters in that path
 * @returns A promise that resolves to an array of objects.
 */
const getParametersByPath = path => {

    return new Promise((res, rej) => {

        parameterStore.getParametersByPath({
            Path: path,
            WithDecryption: true
        }, (err, data) => {
            if (err) {
                return rej(err)
            }
            return res(data)
        })

    })

}

/**
 * It gets all the parameters from the path '/polygon-hackathon/dev/' and returns an object with the
 * name of the parameter as the key and the value of the parameter as the value
 */
const getParametersNameAndValue = async () => {

    /* Getting all the parameters from the path '/polygon-hackathon/dev/' */
    const params = await getParametersByPath('/polygon-hackathon/dev/')

    /* Checking if the `params` variable is not null. If it is not null, it will return a JSON object
    with the status code 500 and a message. */
    if (!params) {
        return res.status(500).json({
            success: false,
            message: 'credential is not founded'
        })
    }

    const { Parameters } = params

    const parameterWithNameAndValue = Parameters.reduce((acc, param) => {

        let name = ''
        let bd = false

        for (let x = param.Name.length - 1; x > 0 && bd !== true; x--) {
            if (param.Name[x] === '/') {
                bd = true
            } else {
                name = param.Name[x] + name
            }
        }

        acc[name] = {
            "name": name,
            "value": param.Value
        }

        return acc

    }, {})

    return parameterWithNameAndValue

}

/* Exporting the function `getParametersNameAndValue` so that it can be used in other files. */
module.exports = getParametersNameAndValue