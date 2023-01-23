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

  const getLatestEvents = () => {
    return new Promise(function(resolve, reject) {
      pool.query(`select dt, slot, owner, floor(sol) as sol, floor(delta) as delta from sol_delta_data order by dt desc limit 50`, (error, results) => {
        if (error) {
          reject(error)
        }
        resolve(results.rows);
      })
    }) 
  }
  
  module.exports = {
    getExchangeBalance,
    getLatestEvents
  }
