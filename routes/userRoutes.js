import express from 'express';
import userController from '../controllers/userController.js';
const {registerUser, loginUser, getUser} = userController
const router = express.Router();
console.log('user routes')
router.post('/', registerUser) 
router.post('/login', loginUser) 
router.get('/me', getUser) 


export default router;