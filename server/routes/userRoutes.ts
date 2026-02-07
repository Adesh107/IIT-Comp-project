import Express from "express";
import { 
    getUserCredits, 
    getUserProjects, 
    createUserProject, 
    getUserProject,    
    purchaseCredits, 
    togglePublish 
} from '../controllers/userController.js';
import { protect } from "../middlewares/auth.js";

const userRouter = Express.Router();

userRouter.get('/credits', protect, getUserCredits);

// FIXED: Use correct controller for creating projects
userRouter.post('/project', protect, createUserProject); 

// FIXED: Use singular controller for getting one project
userRouter.get('/project/:projectId', protect, getUserProject);

// FIXED: Use plural controller for getting list
userRouter.get('/projects', protect, getUserProjects);

userRouter.get('/publish-toggle/:projectId', protect, togglePublish);
userRouter.post('/purchase-credits', protect, purchaseCredits);

export default userRouter;