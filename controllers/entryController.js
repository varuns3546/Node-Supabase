import asyncHandler from 'express-async-handler';
import supabaseClient from '../config/supabaseClient.js';

const {supabase, supabaseAdmin, createUserClient} = supabaseClient;

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
        
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Use the createUserClient from your config file instead
    req.supabase = createUserClient(token);
        
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

const getEntries = asyncHandler(async (req, res) => {
  const { data, error } = await req.supabase
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }

  res.status(200).json({
    success: true,
    message: 'Entries retrieved successfully',
    data: data,
    count: data.length
  });
});

const getEntry = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Entry ID is required'
    });
  }

  const { data, error } = await req.supabase
    .from('entries')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(404).json({ 
      success: false,
      error: 'Entry not found' 
    });
  }

  res.status(200).json({
    success: true,
    message: 'Entry retrieved successfully',
    data: data
  });
});

const createEntry = asyncHandler(async (req, res) => {
  const { title, content } = req.body;

  // Validation
  if (!title || !content) {
    return res.status(400).json({
      success: false,
      error: 'Title and content are required'
    });
  }

  const { data, error } = await req.supabase
    .from('entries')
    .insert({
      title,
      content,
      user_id: req.user.id
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }

  res.status(201).json({
    success: true,
    message: 'Entry created successfully',
    data: data
  });
});

const updateEntry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Entry ID is required'
    });
  }

  // Validation - at least one field should be provided
  if (!title && !content) {
    return res.status(400).json({
      success: false,
      error: 'At least title or content must be provided'
    });
  }

  // Build update object with only provided fields
  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (content !== undefined) updateData.content = content;

  const { data, error } = await req.supabase
    .from('entries')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }

  res.status(200).json({
    success: true,
    message: 'Entry updated successfully',
    data: data
  });
});

const deleteEntry = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Entry ID is required'
    });
  }

  const { error } = await req.supabase
    .from('entries')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }

  res.status(200).json({
    success: true,
    message: 'Entry deleted successfully'
  });
});

export default {
  authenticateUser,
  getEntries,
  getEntry,
  createEntry,
  deleteEntry,
  updateEntry
};