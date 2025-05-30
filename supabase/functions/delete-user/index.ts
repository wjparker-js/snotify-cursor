
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    // Parse the request body
    const { userId } = await req.json()
    
    if (!userId) {
      throw new Error('Missing required field: userId')
    }
    
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables for Supabase connection')
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
      }
    })
    
    // First, delete any user playlists
    const { error: playlistError } = await supabase
      .from('playlists')
      .delete()
      .eq('owner_id', userId)
    
    if (playlistError) {
      console.error('Error deleting user playlists:', playlistError)
      // Continue despite playlist deletion errors
    }
    
    // Delete the user using the admin API
    const { error: userError } = await supabase.auth.admin.deleteUser(userId)
    
    if (userError) {
      throw userError
    }
    
    return new Response(
      JSON.stringify({ success: true, message: 'User deleted successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error deleting user:', error)
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
