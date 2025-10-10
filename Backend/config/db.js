const mongoose = require('mongoose');
require('dotenv').config();
const {Pool} = require('pg');

const pool = new Pool({

  host: 'localhost',
  database: 'entity_data',
  user: 'postgres',
  password: 'Jayansh@1523',
  port: 5432,
});

// Test connection
pool.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch(err => console.error("Connection error", err.stack));

module.exports = pool;