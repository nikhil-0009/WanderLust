// functions/server.js
const serverless = require('serverless-http');
const app = require('../app'); // your Express setup in app.js

module.exports.handler = serverless(app);