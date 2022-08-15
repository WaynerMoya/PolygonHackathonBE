const AWS = require('aws-sdk')

AWS.config.update({
    region: 'us-east-2'
})

const parameterStore = new AWS.SSM()

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

const getParametersNameAndValue = async () => {

    const params = await getParametersByPath('/polygon-hackathon/dev/')

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

    /** 

    return Parameters.map(item => {

        let name = ''
        let bd = false

        for (let x = item.Name.length - 1; x > 0 && bd !== true; x--) {
            if (item.Name[x] === '/') {
                bd = true
            } else {
                name = item.Name[x] + name
            }
        }

        return {
            [name]: item.Name,
            value: item.Value
        }
    })
    */
}

module.exports = getParametersNameAndValue

/*

exports.handler = async (event) => {

    const param = await getParam('/my-app/dev/moralis-other-example')

    console.log(param);

    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!')
    };
    return response;
};

*/