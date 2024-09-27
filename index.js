require('dotenv').config();
const express = require('express')
const app = express()
const port = 3001

var cors = require('cors');

const query_server = require('./query_server')

app.use(cors())

app.get('/poolratios', (req, res) => {
  query_server.getPoolRatios()
  .then(response => {
    res.status(200).send(response);
  })
  .catch(error => {
    res.status(500).send(error);
  })
})

app.get('/total', (req, res) => {
  query_server.getTotalExchangeBalance()
  .then(response => {
    res.status(200).send(response);
  })
  .catch(error => {
    res.status(500).send(error);
  })
})

app.get('/unlocks', (req, res) => {
  query_server.getUnlockSchedule()
  .then(response => {
    res.status(200).send(response);
  })
  .catch(error => {
    res.status(500).send(error);
  })
})

app.get('/largestunlocks', (req, res) => {
  query_server.getLargestUnlocks()
  .then(response => {
    res.status(200).send(response);
  })
  .catch(error => {
    res.status(500).send(error);
  })
})

app.get('/labels/:owner', (req, res) => {
  query_server.getWalletLabels(req.params.owner)
  .then(response => {
    res.status(200).send(response);
  })
  .catch(error => {
    res.status(500).send(error);
  })
})

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

// app.get('/wsevents', (req, res) => {
//   query_server.getWebsocketEvents()
//   .then(response => {
//     res.status(200).send(response);
//   })
//   .catch(error => {
//     res.status(500).send(error);
//   })
// })

app.get('/wsevents', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  
  query_server.getWebsocketEvents(page, limit)
  .then(response => {
    res.status(200).send(response);
  })
  .catch(error => {
    res.status(500).send(error);
  })
})

// app.get('/stakeevents', (req, res) => {
//   query_server.getStakeEvents()
//   .then(response => {
//     res.status(200).send(response);
//   })
//   .catch(error => {
//     res.status(500).send(error);
//   })
// })

app.get('/stakeevents', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  
  query_server.getStakeEvents(page, limit)
  .then(response => {
    res.status(200).send(response);
  })
  .catch(error => {
    res.status(500).send(error);
  })
})

app.get('/stakechartdata', (req, res) => {
  query_server.getStakeChartData()
  .then(response => {
    res.status(200).send(response);
  })
  .catch(error => {
    res.status(500).send(error);
  })
})

app.get('/supply', (req, res) => {
  query_server.getSolanaSupply()
  .then(response => {
    res.status(200).send(response);
  })
  .catch(error => {
    res.status(500).send(error);
  })
})

app.get('/ruggers', (req, res) => {
  query_server.getStakeRuggers()
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
