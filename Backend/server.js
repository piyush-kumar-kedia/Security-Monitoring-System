import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/mdb.js';

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

import apiRoutes from './routes/api.js';
import authRoutes from './routes/authRoutes.js';

app.use('/api', apiRoutes);
app.use('/auth', authRoutes);

app.get('/',(req,res)=>{
    res.send("Server is running");
});

const PORT = process.env.PORT;

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}/`));