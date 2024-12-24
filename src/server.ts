import express, { Application } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { createPool } from './config/db.config';
import { routes } from '../src/routes/routes';

dotenv.config();

// Database Connection
export const dbPool = createPool();

const app: Application = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.json());

app.use('/api', routes);

// Basic error handling middleware
// app.use((err: Error, req: Request, res: Response, next: Function) => {
//   console.error(err.stack);
//   res.status(500).json({
//     error: 'Internal Server Error',
//     status: 500,
//     details: process.env.NODE_ENV === 'dev' ? err.message : undefined
//   });
// });

app.listen(port, function () {
  console.log(`starting app on: ${port}`);
});

export default app;
