import { Router } from 'express';
import { getAllUsers, toggleUserStatus } from '../controllers/user.controller.js';
const superAdminRouter = Router();

superAdminRouter.get('/getAllUsers', getAllUsers);

superAdminRouter.get('/toggleStatus', toggleUserStatus);

export default superAdminRouter;