/* eslint consistent-return:0 import/order:0 */

const express = require('express');
const logger = require('./logger');


require('dotenv').config()
var dwolla = require('dwolla-v2');

const argv = require('./argv');
const port = require('./port');
const setup = require('./middlewares/frontendMiddleware');
const isDev = process.env.NODE_ENV !== 'production';
const ngrok =
  (isDev && process.env.ENABLE_TUNNEL) || argv.tunnel
    ? require('ngrok')
    : false;
const { resolve } = require('path');
const app = express();



// If you need a backend, e.g. an API, add your custom backend-specific middleware here
// app.use('/api', myApi);
var client = new dwolla.Client({
  key: process.env.DWOLLA_APP_KEY,
  secret: process.env.DWOLLA_APP_SECRET,
  environment: 'sandbox',
});
app.use('/iav', async function(req, res) {
  console.log("req for iav");
  const appToken = await client.auth.client();
  
    appToken
    .post(`https://api-sandbox.dwolla.com/customers/f6f37481-1205-4c28-9406-962241b66658/iav-token`).then(resIAV => {
        console.log('got token', resIAV.body.token);
        res.send({token:resIAV.body.token}).end();
    })
    
})

// In production we need to pass these values in instead of relying on webpack
setup(app, {
  outputPath: resolve(process.cwd(), 'build'),
  publicPath: '/',
});

// get the intended host and port number, use localhost and port 3000 if not provided
const customHost = argv.host || process.env.HOST;
const host = customHost || null; // Let http.Server use its default IPv6/4 host
const prettyHost = customHost || 'localhost';

// use the gzipped bundle
app.get('*.js', (req, res, next) => {
  req.url = req.url + '.gz'; // eslint-disable-line
  res.set('Content-Encoding', 'gzip');
  next();
});













// Start your app.
app.listen(port, host, async err => {
  if (err) {
    return logger.error(err.message);
  }

  // Connect to ngrok in dev mode
  if (ngrok) {
    let url;
    try {
      url = await ngrok.connect(port);
    } catch (e) {
      return logger.error(e);
    }
    logger.appStarted(port, prettyHost, url);
  } else {
    logger.appStarted(port, prettyHost);
  }
});
