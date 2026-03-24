import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import newConnection from './src/database/db.js';
import authRoute from './src/routes/auth.route.js';
import cookieParser from 'cookie-parser';
import groupRoute from './src/routes/group.route.js';
import { authentication } from './src/middlewares/authentication.middleware.js';
import { roleBasedAuth } from './src/middlewares/roleBaseAuth.middleware.js';
import { getAllUsers } from './src/controllers/user.controller.js';
import queueRoute from './src/routes/queue.route.js';
import ticketRoute from './src/routes/ticket.route.js';
// import dotenv from 'dotenv';
// dotenv.config();

const app = express();

const corsOptions = {
    origin: process.env.FRONTEND_URL || "*",
    credentials: true
}

app.use(helmet({
    strictTransportSecurity: false
}))

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// connecting DB
newConnection()
    .then(() => console.log("DB Connected"))
    .catch(err => console.log(`DB Error : ${err}`));

// routes

// auth
app.use('/api/v1/users/auth', authRoute);

// group
app.use('/api/v1/group/', authentication, groupRoute);

// queue
app.use('/api/v1/queue/', authentication, roleBasedAuth('admin', 'superAdmin'), queueRoute);

// super admin
app.use('/api/v1/superAdmin/', authentication, roleBasedAuth('superAdmin'), getAllUsers);

// ticket 
app.use('/api/v1/queue/ticket/', authentication, roleBasedAuth('admin', 'superAdmin'), ticketRoute)
export default app;