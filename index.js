/****************************************************************************************** */
/****************************************************************************************** */
/******************************* DECLARE LIBRARY AND MODULES ****************************** */
/****************************************************************************************** */
/****************************************************************************************** */

/* Importing the cors module.  */
const cors = require("cors")

/* Importing the express module. */
const express = require('express')

/* Importing the Moralis library. */
const Moralis = require("moralis/node");

/* Importing the file `global/ssm-parameters.js` and assigning it to the variable
`getParametersNameAndValue`. */
const getParametersNameAndValue = require("./global/ssm-parameters")

/* Setting the port to the environment variable PORT or 3001 
if the environment variable is not set. */
const port = process.env.PORT || 3001;

/* Setting the environment variable to the value of the environment 
variable NODE_ENV or 'local' if the environment variable NODE_ENV is not set. */
const environment = process.env.NODE_ENV || 'local'

/****************************************************************************************** */
/****************************************************************************************** */
/************************************* IMPORT ROUTES ************************************** */
/****************************************************************************************** */
/****************************************************************************************** */


/* Importing the file `routes/nft.js` and assigning it to the variable `nft`. */
const nft = require('./routes/nft')

/* This is importing the file `routes/foundation.js` and assigning it to the variable `foundation`. */
const foundation = require('./routes/foundation')

/* This is importing the file `routes/post.js` and assigning it to the variable `post`. */
const post = require('./routes/post')

/* This is importing the file `routes/cause.js` and assigning it to the variable `cause`. */
const cause = require('./routes/cause')

/* This is importing the file `routes/step.js` and assigning it to the variable `step`. */
const step = require('./routes/step')

/****************************************************************************************** */
/****************************************************************************************** */
/**************************************** START CODE ************************************** */
/****************************************************************************************** */
/****************************************************************************************** */

/* Creating an instance of the express module. */
const app = express()

/* Calling the function `getParametersNameAndValue` and assigning the value it returns to the variable
`params`. */
getParametersNameAndValue().then(params => {
  /* Starting the Moralis library. */
  Moralis.start({
    serverUrl: params['moralis-server-url'].value,
    appId: params['moralis-api-id'].value,
    masterKey: params['moralis-master-key'].value
  });
})

/* This is a whitelist of domains that are allowed to make requests to the server. */
const whitelist = [
  "http://localhost:3000",
  "http://polygon-alb-1640202886.us-east-2.elb.amazonaws.com",
  "http://donaty-web-app.s3-website-us-east-1.amazonaws.com",
  "http://polygon-alb-1640202886.us-east-2.elb.amazonaws.com/*",
  "http://donaty-web-app.s3-website-us-east-1.amazonaws.com/*",
  "http://polygon-alb-1640202886.us-east-2.elb.amazonaws.com/**",
  "http://donaty-web-app.s3-website-us-east-1.amazonaws.com/**",
]

/* This is a whitelist of domains that are allowed to make requests to the server. */
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
}

/* This is a whitelist of domains that are allowed to make requests to the server. */
app.use(cors(corsOptions))

/* This is setting the limit of the size of the request body to 200mb. */
app.use(express.json({
  limit: '200mb',
  extended: true,
  parameterLimit: 100000
}));

app.use(express.urlencoded({
  limit: '200mb',
  extended: true,
  parameterLimit: 100000
}));

app.use(express.text({ limit: '200mb' }));

/****************************************************************************************** */
/****************************************************************************************** */
/****************************************** ROUTES **************************************** */
/****************************************************************************************** */
/****************************************************************************************** */

/* Telling the server to use the routes in the file `routes/nft.js` when the path starts with `/nft`. */
app.use('/nft', nft)

/* Telling the server to use the routes in the file `routes/foundation.js` when the path starts with `/foundation`. */
app.use('/foundation', foundation)

/* Telling the server to use the routes in the file `routes/post.js` when the path starts with `/post`. */
app.use('/post', post)

/* Telling the server to use the routes in the file `routes/cause.js` when the path starts with
`/cause`. */
app.use('/cause', cause)

/* Telling the server to use the routes in the file `routes/step.js` when the path starts with `/step`. */
app.use('/step', step)

/****************************************************************************************** */
/****************************************************************************************** */
/***************************************** LISTENER *************************************** */
/****************************************************************************************** */
/****************************************************************************************** */

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'OK'
  })
})

/* Telling the server to listen for requests on the port specified by the variable `port`. */
app.listen(port, () => {

  /* Using a template literal to print the value of the variable `port` to the console. */
  console.log(`Server is running on port ${port}`)

  /* Using a template literal to print the value of the variable `environment` to the console. */
  console.log(`Environment: ${environment}`)
})