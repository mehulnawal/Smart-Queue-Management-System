import { Router } from 'express';
import { createGroup, deleteGroup, getAllGroup, updateGroup } from '../controllers/group.controller.js';
const groupRoute = Router();

groupRoute.get('/allGroup', getAllGroup);
groupRoute.post('/newGroup', createGroup);
groupRoute.delete('/deleteGroup/:groupId', deleteGroup);
groupRoute.patch('/updateGroup/:groupId', updateGroup);

export default groupRoute;