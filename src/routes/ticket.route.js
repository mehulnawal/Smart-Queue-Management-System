import { Router } from 'express';
import { joinQueue, nextCall } from '../controllers/ticket.controller.js';
const ticketRoute = Router();

ticketRoute.get('joinQueue/:queueId', joinQueue);
ticketRoute.patch('callNext/:queueId', nextCall);

export default ticketRoute;