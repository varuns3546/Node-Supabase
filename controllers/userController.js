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

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });
    if(error){
        res.status(400)
        throw new Error('Invalid credentials')
    }
    res.json({
        success: true,
        user: data.user,
        session: data.session,
    })



        

})

const getUser = asyncHandler(async (req, res) => {
    // Extract access token from request header
    const accessToken = extractTokenFromHeader(req);
  
    if (!accessToken) {
      return res.status(401).json({
        success: false,
        error: 'Access token is required. Please provide Authorization header with Bearer token.'
      });
    }
  
    
      // Get user from Supabase using the access token
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error) {
    return res.status(401).json({
        success: false,
        error: error.message
    });
    }

    if (!user) {
    return res.status(404).json({
        success: false,
        error: 'User not found'
    });
    }

    // Return formatted user data
    res.status(200).json({
    success: true,
    message: 'User retrieved successfully',
    user: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
        userMetadata: user.user_metadata,
        appMetadata: user.app_metadata
    }
    });

    
  });

const extractTokenFromHeader = (req) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    
    if (!authHeader) {
      return null;
    }
  
    // Handle "Bearer <token>" format
    if (authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1]; // Remove "Bearer " prefix
    }

  
    // Handle direct token (less common)
    return authHeader;
};
export default {registerUser, loginUser, getUser}