const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser= require('cookie-parser');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json()); // Body parser
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);       // Enable Cross-Origin Resource Sharing
app.use(cookieParser());

// Mount routers
app.use('/api', require('./routes/api.js'));

app.use('/auth', require('./routes/authRoutes.js'));

app.get('/',(req,res)=>{
    res.send("Server is running");
});

const PORT = process.env.PORT;

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}/`));