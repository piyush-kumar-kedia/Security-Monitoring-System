const mongoose = require('mongoose');
require('dotenv').config();
const {Pool} = require('pg');

const pool = new Pool({
  connectionString: "postgresql://postgres:Jayansh%401523@db.dwzkpftvngzpckkxmtii.supabase.co:5432/postgres"
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