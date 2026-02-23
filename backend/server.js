import express from 'express';
import dotenv from 'dotenv';
import connectDb from './db/connectDb.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import documentRoutes from './routes/documentRoutes.js';

dotenv.config();

const app = express(); 
const PORT = process.env.PORT || 5000;
const isDev = process.env.NODE_ENV !== 'production';

app.use(cookieParser());

const allowedOrigins = [
 // "https://hack-odhisha-team-fb.vercel.app",
  "http://localhost:3000",
  "http://localhost:8081",
  "http://10.158.87.77:8081",
  "http://localhost:8080",
  // Vite dev server default
  "http://localhost:5173"
];

// In development, reflect whatever origin made the request to simplify local testing across IPs/ports
const corsOptions = isDev
  ? {
      origin: true, // reflect request origin
      methods: [" GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }
  : {
      origin: allowedOrigins,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    };

app.use(cors(corsOptions)); 

// Parse body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes); 

// Connect to MongoDB
connectDb();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start HTTP server (no SSL)
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
