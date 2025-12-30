import dotenv from 'dotenv';
import pkg from 'pg';
const {Pool} = pkg;

dotenv.config();

const pool = new Pool({
  host: process.env.DB_MAIN_HOST,
  database: process.env.DB_MAIN_NAME,
  user: process.env.DB_MAIN_USER,
  password: process.env.DB_MAIN_PASSWORD,
  port: process.env.DB_MAIN_PORT,
});

pool.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch(err => console.error("Connection error", err.stack));

export default pool;