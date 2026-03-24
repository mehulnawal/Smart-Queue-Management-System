import { Router } from 'express'
import { deleteUser, logOut, resetTokens, updateUser, userLogin, userRegister } from '../controllers/user.controller.js';
import upload from '../middlewares/multer.middleware.js';
const authRoute = Router();

authRoute.post('/register', upload.single('profileImage'), userRegister);
authRoute.post('/login', userLogin);
authRoute.get('/logout/:userId', logOut);
authRoute.get('/tokensReset', resetTokens);

authRoute.delete('/deleteUser/:userId', deleteUser);
authRoute.patch('/updateUser/:userId', upload.single("profileImage"), updateUser);

export default authRoute;