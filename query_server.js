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



  module.exports = {
    getExchangeBalance,
    getInflowData,
    getLatestEvents,
    getLatestBalances,
    getWebhookEvents
  }
