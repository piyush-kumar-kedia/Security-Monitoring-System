const mongoose = require('mongoose');
require('dotenv').config();
const {Pool} = require('pg');

const pool = new Pool({

  host: 'db.tlruewxqrjvkyypmsbfg.supabase.co',
  database: 'postgres',
  user: 'postgres',
  password: 'ethos_prod',
  port: 5432,
  ssl: { rejectUnauthorized: false }

});

// Test connection
pool.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch(err => console.error("Connection error", err.stack));

// const connectDB = async () => {
//     try {
//         const conn = await mongoose.connect(process.env.MONGO_URI, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         });
//         console.log(`MongoDB Connected: ${conn.connection.host}`);
//     } catch (error) {
//         console.error(`Error: ${error.message}`);
//         process.exit(1);
//     }
// };

module.exports = pool;