require('dotenv').config();
const express = require('express')
const app = express()
const port = 3001

var cors = require('cors');

const query_server = require('./query_server')

app.use(cors())

app.get('/balances', (req, res) => {
  query_server.getLatestBalances()
  .then(response => {
    res.status(200).send(response);
  })
  .catch(error => {
    res.status(500).send(error);
  })
})

app.get('/events', (req, res) => {
  query_server.getLatestEvents()
  .then(response => {
    res.status(200).send(response);
  })
  .catch(error => {
    res.status(500).send(error);
  })
})

app.get('/whevents', (req, res) => {
  query_server.getWebhookEvents()
  .then(response => {
    res.status(200).send(response);
  })
  .catch(error => {
    res.status(500).send(error);
  })
})

app.get('/inflows', (req, res) => {
  query_server.getInflowData()
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

app.get('/:exchange/:mint', (req, res) => {
  query_server.getExchangeSplBalance(req.params.exchange, req.params.mint)
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
