import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials are missing. Please check your .env file.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    console.log('Testing Supabase connection...');

    const { data, error } = await supabase.from('patients').select('*').limit(1);

    if (error) {
        console.error('Connection failed:', error.message);
        process.exit(1);
    }

    console.log('Successfully connected to Supabase!');
    console.log('Patients preview:', data);

    if (data && data.length === 0) {
        console.log('No patients found. Consider adding some mock data to the database.');
    }
}

testConnection();
