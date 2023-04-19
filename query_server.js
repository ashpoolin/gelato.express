require('dotenv').config();
const Pool = require('pg').Pool
const pool = new Pool({
    user: process.env.PGUSERNAME,
    host: process.env.PGHOSTNAME,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
  });

  // gives you the last week of data
const after = (new Date(Date.now() - 604800000)).toISOString().split('T')[0];
const after_inflows = '2022-11-30'

  const getWalletLabels = (address) => {
    return new Promise(function(resolve, reject) {
      pool.query(`SELECT * FROM sol_address_defs where address = '${address}'`, (error, results) => {
        if (error) {
          reject(error)
        }
        resolve(results.rows);
      })
    }) 
  }

  const getPoolRatios = () => {
    return new Promise(function(resolve, reject) {
      pool.query(`SELECT * FROM pool_ratios_current`, (error, results) => {
        if (error) {
          reject(error)
        }
        resolve(results.rows);
      })
    }) 
  }

  const getExchangeBalance = (exchange) => {
    return new Promise(function(resolve, reject) {
      pool.query(`SELECT * FROM sol_event_log_reduced where owner = '${exchange}' and date_trunc > '${after}'`, (error, results) => {
        if (error) {
          reject(error)
        }
        resolve(results.rows);
      })
    }) 
  }

  const getExchangeSplBalance = (exchange, mint) => {
    return new Promise(function(resolve, reject) {
      pool.query(`SELECT * FROM spl_event_log_reduced where owner = '${exchange}' and mint = '${mint}' and date::date > '${after}'`, (error, results) => {
        if (error) {
          reject(error)
        }
        resolve(results.rows);
      })
    }) 
  }

  const getLatestBalances = () => {
    return new Promise(function(resolve, reject) {
      pool.query(`SELECT *, FLOOR(latest_balance / (select sum(latest_balance) from latest_exchange_balances) * 100 * 100) / 100 as pct_share FROM latest_exchange_balances order by latest_balance DESC;`, (error, results) => {
        if (error) {
          reject(error)
        }
        resolve(results.rows);
      })
    }) 
  }

  const getInflowData = () => {
    return new Promise(function(resolve, reject) {
      pool.query(`select t1.*, FLOOR(t1.inflows/abs(t1.outflows) * 100) / 100 as ratio from (select dt::date, sum(floor(delta)) as net, sum(floor(delta)) FILTER (WHERE delta > 0) AS inflows, sum(floor(delta)) FILTER (WHERE delta <= 0) AS outflows from sol_delta_data where dt::date > '${after_inflows}' group by dt::date order by dt::date asc) t1`, (error, results) => {
        if (error) {
          reject(error)
        }
        resolve(results.rows);
      })
    }) 
  }

  const getLatestEvents = () => {
    return new Promise(function(resolve, reject) {
      pool.query(`select dt, slot, owner, floor(sol) as sol, floor(delta) as delta from sol_delta_data order by dt desc limit 100`, (error, results) => {
        if (error) {
          reject(error)
        }
        resolve(results.rows);
      })
    }) 
  }

  const getWebhookEvents = () => {
    return new Promise(function(resolve, reject) {
      pool.query(`select * from webhooks_sol_event_log_labeled where amount > 10000 order by dt desc limit 100;`, (error, results) => {
        if (error) {
          reject(error)
        }
        resolve(results.rows);
      })
    }) 
  }

  const getStakeEvents = () => {
    return new Promise(function(resolve, reject) {
      pool.query(`select t1.program, t1.type, to_timestamp(t1.blocktime) as dt, t1.signature, t1.authority2, t1.source, t1.destination, t1.uiamount from (select distinct * from stake_program_event_log where uiAmount > 8000) t1 order by t1.blocktime desc limit 250;`, (error, results) => {
        if (error) {
          reject(error)
        }
        resolve(results.rows);
      })
    }) 
  }

  const getStakeChartData = () => {
    return new Promise(function(resolve, reject) {
      pool.query(`select to_timestamp(t1.blocktime)::date as date, FLOOR(sum(CASE WHEN t1.type = 'createAccount' OR t1.type = 'createAccountWithSeed' THEN t1.uiAmount ELSE 0 END)) as deposit, FLOOR(sum(CASE WHEN t1.type = 'withdraw' THEN t1.uiAmount ELSE 0 END)) as withdraw, FLOOR(sum(CASE WHEN t1.type = 'createAccount' OR t1.type = 'createAccountWithSeed' THEN t1.uiAmount ELSE 0 END)) - FLOOR(SUM(CASE WHEN t1.type = 'withdraw' THEN t1.uiAmount ELSE 0 END)) as net from (select distinct * from stake_program_event_log where type like 'withdraw' OR type like 'createAccount' OR type like 'createAccountWithSeed' order by uiAmount desc) t1 group by date order by date asc;`, (error, results) => {
        if (error) {
          reject(error)
        }
        resolve(results.rows);
      })
    }) 
  }


  module.exports = {
    getWalletLabels,
    getPoolRatios,
    getExchangeBalance,
    getExchangeSplBalance,
    getInflowData,
    getLatestEvents,
    getLatestBalances,
    getWebhookEvents,
    getStakeEvents,
    getStakeChartData
  }
