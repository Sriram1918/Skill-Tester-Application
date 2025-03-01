import express from 'express';
import cors from 'cors';
import reportsRouter from './routes/reports';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true
}));

app.use(express.json());

// Mount routes
app.use('/api/reports', reportsRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

export default app; 