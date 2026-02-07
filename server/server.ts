import express, { Request, Response } from 'express';
import 'dotenv/config'
import cors from 'cors';
import userRouter from './routes/userRoutes.js';
import projectRouter from './routes/projectRoutes.js';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';

const app = express();
const port = 3000;

// FIXED: Hardcoded localhost to guarantee CORS works
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000", process.env.TRUSTED_ORIGINS || ""], 
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// FIXED: Add Body Parser (CRITICAL for login)
app.use(express.json({limit:'50mb'}));

// FIXED: Connect Better Auth routes
app.all("/api/auth/*", toNodeHandler(auth));

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});

// FIXED: Separate routes to avoid conflict
app.use('/api/user', userRouter);
app.use('/api/projects', projectRouter);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});