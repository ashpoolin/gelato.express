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
const after = (new Date(Date.now() - 604800000)).toISOString().split('T')[0]; // 7 days = 7day x 1000 ms x 60 sec x 60 min x 24 hours
const after_inflows = (new Date(Date.now() - 7776000000)).toISOString().split('T')[0]; // 90 days = 90day x 1000 ms x 60 sec x 60 min x 24 hours
const after_stake = '2022-04-01'

// const getStakeEvents = () => {
//   return new Promise(function(resolve, reject) {
//     pool.query(`select t1.program, t1.type, to_timestamp(t1.blocktime) as dt, t1.signature, t1.authority2, t1.source, t1.destination, t1.uiamount from (select distinct * from stake_program_event_log where uiAmount > 8000) t1 order by t1.blocktime desc limit 1000;`, (error, results) => {
//       if (error) {
//         reject(error)
//       }
//       resolve(results.rows);
//     })
//   }) 
// }

async function getStakeEvents(page = 1, limit = 25) {
  const offset = (page - 1) * limit;
  const query = `
    SELECT t1.program, t1.type, to_timestamp(t1.blocktime) as dt, t1.signature, t1.authority2, t1.source, t1.destination, t1.uiamount
    FROM (SELECT DISTINCT * FROM stake_program_event_log WHERE uiAmount > 8000) t1
    ORDER BY t1.blocktime DESC
    LIMIT $1 OFFSET $2
  `;
  
  try {
    const result = await pool.query(query, [limit, offset]);
    const totalCountResult = await pool.query('SELECT COUNT(*) FROM stake_program_event_log WHERE uiAmount > 8000');
    const totalCount = parseInt(totalCountResult.rows[0].count);
    
    return {
      data: result.rows,
      totalCount: totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit)
    };
  } catch (err) {
    console.error('Error executing query', err.stack);
    throw err;
  }
}

const getStakeChartData = () => {
  return new Promise(function(resolve, reject) {
    pool.query(`select to_timestamp(t1.blocktime)::date as date, FLOOR(sum(CASE WHEN t1.type = 'createAccount' OR t1.type = 'createAccountWithSeed' THEN t1.uiAmount ELSE 0 END)) as deposit, FLOOR(sum(CASE WHEN t1.type = 'withdraw' THEN -1*t1.uiAmount ELSE 0 END)) as withdraw, FLOOR(sum(CASE WHEN t1.type = 'createAccount' OR t1.type = 'createAccountWithSeed' THEN t1.uiAmount ELSE 0 END)) + FLOOR(SUM(CASE WHEN t1.type = 'withdraw' THEN -1*t1.uiAmount ELSE 0 END)) as net from (select * from stake_program_event_log where blocktime > extract(epoch from now() - interval '3 months') AND (type = 'withdraw' OR type like 'createAccount%') order by uiAmount desc) t1 group by date order by date asc;`, (error, results) => {
      if (error) {
        reject(error)
      }
      resolve(results.rows);
    })
  }) 
}

const getSolanaSupply = () => {
  return new Promise(function(resolve, reject) {
    pool.query(`SELECT * FROM solana_supply_enhanced where dt::date > '${after_stake}'`, (error, results) => {
      if (error) {
        reject(error)
      }
      resolve(results.rows);
    })
  }) 
}

const getUnlockSchedule = () => {
  return new Promise(function(resolve, reject) {
    pool.query(`select * from stake_unlock_schedule;`, (error, results) => {
      if (error) {
        reject(error)
      }
      resolve(results.rows);
    })
  }) 
}

const getLargestUnlocks = () => {
  return new Promise(function(resolve, reject) {
    pool.query(`select * from stake_largest_unlocks;`, (error, results) => {
      if (error) {
        reject(error)
      }
      resolve(results.rows);
    })
  }) 
}
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


  const getTotalExchangeBalance = () => {
    return new Promise(function(resolve, reject) {
      pool.query(`SELECT * FROM on_exchange_total_balance_log_w_delta;`, (error, results) => {
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

  // const getWebsocketEvents = () => {
  //   return new Promise(function(resolve, reject) {
  //     pool.query(`select * from websockets_sol_event_log_labeled where uiamount >= 9999 order by dt desc limit 1000;`, (error, results) => {
  //       if (error) {
  //         reject(error)
  //       }
  //       resolve(results.rows);
  //     })
  //   }) 
  // }

  async function getWebsocketEvents(page = 1, limit = 100) {
    const offset = (page - 1) * limit;
    const query = `
      SELECT dt, signature, source as source, source_label, destination as destination, destination_label, uiamount
      FROM websockets_sol_event_log_labeled
      WHERE uiamount >= 9999
      ORDER BY dt DESC
      LIMIT $1 OFFSET $2
    `;
    
    try {
      const result = await pool.query(query, [limit, offset]);
      const totalCountResult = await pool.query('SELECT COUNT(*) FROM websockets_sol_event_log_labeled WHERE uiamount >= 9999');
      const totalCount = parseInt(totalCountResult.rows[0].count);
      
      return {
        data: result.rows,
        totalCount: totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit)
      };
    } catch (err) {
      console.error('Error executing query', err.stack);
      throw err;
    }
  }

  const getStakeRuggers = () => {
    return new Promise(function(resolve, reject) {
      pool.query(`select * from stake_program_ruggers;`, (error, results) => {
        if (error) {
          reject(error)
        }
        resolve(results.rows);
      })
    }) 
  }

  module.exports = {
    getTotalExchangeBalance,
    getStakeEvents,
    getStakeChartData,
    getSolanaSupply,
    getWalletLabels,
    getUnlockSchedule,
    getLargestUnlocks,
    getPoolRatios,
    getExchangeBalance,
    getExchangeSplBalance,
    getInflowData,
    getLatestEvents,
    getLatestBalances,
    getWebhookEvents,
    getWebsocketEvents,
    getStakeRuggers
  }
