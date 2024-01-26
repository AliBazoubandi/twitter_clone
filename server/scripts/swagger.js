const swaggerAutogen = require('swagger-autogen')();

const outputFile = '../swagger-output.json';
const endpointsFiles = ['../routes/userRoutes.js', '../routes/tweetRoutes.js'];

swaggerAutogen(outputFile, endpointsFiles);
