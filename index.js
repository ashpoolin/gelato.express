require('dotenv').config();
const express = require('express')
const app = express()
const port = 3001

var cors = require('cors');

const query_server = require('./query_server')

// const ALLOWED_URL_1 = process.env.ALLOWED_URL_1;
// const ALLOWED_URL_2 = process.env.ALLOWED_URL_2;
// const ALLOWED_URL_3 = process.env.ALLOWED_URL_3;
// const ALLOWED_URL_4 = process.env.ALLOWED_URL_4;
// const ALLOWED_URL_5 = process.env.ALLOWED_URL_5;
// const ALLOWED_URL_6 = process.env.ALLOWED_URL_6;

app.use(cors())
// app.use(express.json())
// app.use(function (req, res, next) {
//   const allowedOrigins = ['http://localhost:3000', ALLOWED_URL_1, ALLOWED_URL_2, ALLOWED_URL_3, ALLOWED_URL_4, ALLOWED_URL_5, ALLOWED_URL_6];
//   const origin = req.headers.origin;
//   if (allowedOrigins.includes(origin)) {
//        res.setHeader('Access-Control-Allow-Origin', origin);
//   }
//   // res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000'); //this may only allow localhost!
//   // res.header("Access-Control-Allow-Origin", "*");
//   res.setHeader('Access-Control-Allow-Methods', 'GET');
//   // res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers');
//   next();
// });

app.get('/events', (req, res) => {
  query_server.getLatestEvents()
  .then(response => {
    res.status(200).send(response);
  })
  .catch(error => {
    res.status(500).send(error);
  })
})

app.get('/:exchange', (req, res) => {
  query_server.getExchangeBalance(req.params.exchange)
  .then(response => {
    res.status(200).send(response);
  })
  .catch(error => {
    res.status(500).send(error);
  })
})

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})
