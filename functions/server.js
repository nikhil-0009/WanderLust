const { builder } = require("@netlify/express");
const app = require("../app"); // your Express app

// Wrap Express with Netlify's adapter
exports.handler = builder(app);