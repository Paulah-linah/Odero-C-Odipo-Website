// Test script to check database connection and table structure
import { supabase } from './services/supabaseClient.js';

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test 1: Check if we can connect to Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Session:', { session, sessionError });
    
    // Test 2: Check if blog_posts table exists
    const { data: tableData, error: tableError } = await supabase
      .from('blog_posts')
      .select('count')
      .limit(1);
    
    console.log('Table test:', { tableData, tableError });
    
    // Test 3: Check table structure
    const { data: columns, error: columnError } = await supabase
      .rpc('get_table_columns', { table_name: 'blog_posts' });
    
    console.log('Columns:', { columns, columnError });
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testConnection();
