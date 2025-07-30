import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();
const supabaseURL = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(
  supabaseURL, supabaseAnonKey
);

const supabaseAdmin = createClient( supabaseURL, supabaseServiceRoleKey
, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const createUserClient = (token) => {
  return createClient(
    supabaseURL, 
    supabaseAnonKey, 
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  );
};



export default {supabase, supabaseAdmin, createUserClient};