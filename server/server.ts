import express, { Request, Response } from 'express';
import 'dotenv/config'
import cors from 'cors';
import userRouter from './routes/userRoutes.js';
import projectRouter from './routes/projectRoutes.js';

const app = express();

const port = 3000;

const corsOptions = {
    origin: process.env.TRUSTED_ORIGINS?.split(',') || [],
    credentials: true,
}

app.use(cors(corsOptions))

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});
app.use('/api/user', userRouter);
app.use('/api/user', projectRouter);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});