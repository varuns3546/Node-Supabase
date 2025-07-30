# Node.js Supabase Integration

This is a simple Express.js server that connects to Supabase.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create a `.env` file in the root directory with your Supabase credentials:**
   ```
   SUPABASE_URL=https://dnkjlmepjzlhqqnlqvng.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   PORT=3000
   ```

3. **Get your Supabase credentials:**
   - Go to your Supabase project dashboard
   - Navigate to Settings > API
   - Copy the "Project URL" and "anon public" key
   - Replace the values in your `.env` file

4. **Run the server:**
   ```bash
   npm start
   ```

## API Endpoints

- `GET /api/data` - Fetch data from your Supabase table

## Notes

- Make sure you have a table named `users` in your Supabase database
- The table should be in the `public` schema
- Update the table name in `index.js` if you're using a different table 