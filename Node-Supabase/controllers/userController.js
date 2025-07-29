import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import asyncHandler from 'express-async-handler';
import supabaseClient from '../config/supabaseClient.js';
const {supabase, supabaseAdmin} = supabaseClient

const registerUser = asyncHandler(async (req, res) => {
    const {firstName, lastName, email, password, orgPassword} = req.body
    console.log('attempting register')
    if(!firstName || !lastName || !email || !password || !orgPassword){
        res.status(400)
        throw new Error('Please add all fields')
    }

    const ORG_PASSWORDS = {
        [process.env.ORG_PASSWORD_CLIENT]: 'client',
        [process.env.ORG_PASSWORD_MAIN_CONSULTANT]: 'main_consultant',
        [process.env.ORG_PASSWORD_SUB_CONSULTANT]: 'sub_consultant',
    }
    
    const role = ORG_PASSWORDS[orgPassword] || null; // Fixed: use orgPassword instead of inputPassword

    if(role === null){
        res.status(400)
        throw new Error('Enter a valid org password')
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                firstName: firstName,
                lastName: lastName,
            }
        }
    })
    
    if (signUpError) {
        res.status(400)
        throw new Error(`Signup Error: ${signUpError.message}`)
    }

    const userId = signUpData.user.id

    // 2. Update the user's app_metadata with role
    const { data, error: setRoleError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        app_metadata: { role }
    })

    if (setRoleError) {
        res.status(400)
        throw new Error(`Role assignment error: ${setRoleError.message}`)
    }

    // Send success response
    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: {
            id: userId,
            email: signUpData.user.email,
            firstName: firstName,
            lastName: lastName,
            role: role
        }
    })
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