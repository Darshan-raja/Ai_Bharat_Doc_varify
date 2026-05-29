const listEndpoints = require('express-list-endpoints');
const app = require('./server'); // assuming your server file is named server.js

console.log(listEndpoints(app));
