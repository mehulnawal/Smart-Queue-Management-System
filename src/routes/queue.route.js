import { Router } from 'express';
import { closeQueue, createQueue, startQueue } from '../controllers/queue.controller.js';
const queueRoute = Router();

queueRoute.post('/createQueue/:groupId', createQueue);
queueRoute.patch('/openQueue', startQueue);
queueRoute.patch('/closeQueue', closeQueue);

export default queueRoute;