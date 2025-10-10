const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser= require('cookie-parser');
const connectDB = require('./config/mdb');

dotenv.config();

connectDB();

const app = express();

app.use(express.json()); 
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);      
app.use(cookieParser());

app.use('/api', require('./routes/api'));
app.use('/auth', require('./routes/authRoutes.js'));

app.get('/',(req,res)=>{
    res.send("Server is running");
});

const PORT = process.env.PORT;

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}/`));