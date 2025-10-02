const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json()); // Body parser
app.use(cors());         // Enable Cross-Origin Resource Sharing

// Mount routers
app.use('/api', require('./routes/api'));

app.get('/',(req,res)=>{
    res.send("Server is running");
});

const PORT = process.env.PORT;

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}/`));