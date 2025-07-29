import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import asyncHandler from 'express-async-handler';
import { v4 as uuidv4 } from 'uuid';
import userService from '../services/userService.js';
const {createUser, getUsers, getUserById, getUserByEmail, updateUser, deleteUser, searchUsers} = userService
const registerUser = asyncHandler(async (req, res) => {
    const {firstName, lastName, email, password, orgPassword} = req.body

    if(!firstName || !lastName || !email || !password || !orgPassword){
        res.status(400)
        throw new Error('Please add all fields')
    }

    const userExists = await getUserByEmail(email)
    console.log('userExists', userExists)

    if(userExists){        
        res.status(400)
        throw new Error('User already exists')
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = await createUser({
        id: uuidv4(),
        firstName,
        lastName,
        email,
        password: hashedPassword,
        accountType: 'client'
    })

    if(user){
        console.log('Success registering', user.firstName)
        res.status(201).json({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            accountType: user.accountType,
            token: generateToken(user.id)
        })
    } else {
        res.status(400)
        throw new Error('Invalid user data')
    }
    
})

const loginUser = asyncHandler(async (req, res) => {
    const {email, password} = req.body

    if(!email || !password){
        res.status(400)
        throw new Error('Please add all fields')
    }

    const user = await getUserByEmail(email)
    if(!user){
        res.status(400)
        throw new Error('User not found')
    }
    if (user && (await bcrypt.compare(password, user.password))){
        console.log('Success logging in', user.firstName)

        res.json({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            accountType: user.accountType,
            token: generateToken(user.id)
        })
    } else {
        res.status(400)
        throw new Error('Invalid credentials')
    }
})

const getUser = asyncHandler(async (req, res) => {
    const getUser = asyncHandler(async (req, res) => {
        console.log('req.user', req.user)
        const {id, firstName, lastName, email, accountType} = await getUserById(req.user.id)
        res.status(200).json({
            id,
            firstName,
            lastName,
            email,
            accountType
        })
    })
})

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: '30d'})
}
export default {registerUser, loginUser, getUser}