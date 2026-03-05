import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials are missing. Please check your .env file.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const mockPatients = [
    { name: 'Gmaty, Mohamed Aziz', age: 34, last_session: new Date().toISOString(), status: 'Amélioration', avatar: '0D8ABC' },
    { name: 'Dubois, Sophie', age: 42, last_session: new Date(Date.now() - 2 * 86400000).toISOString(), status: 'Stagnation', avatar: '10B981' },
    { name: 'Martin, Lucas', age: 28, last_session: new Date(Date.now() - 5 * 86400000).toISOString(), status: 'Amélioration', avatar: 'F59E0B' },
    { name: 'Bernard, Elodie', age: 55, last_session: new Date(Date.now() - 7 * 86400000).toISOString(), status: 'Fatigue', avatar: 'EF4444' },
];

async function seed() {
    console.log('Inserting mock patients...');
    const { data, error } = await supabase.from('patients').insert(mockPatients).select();

    if (error) {
        console.error('Error inserting data:', error.message);
        process.exit(1);
    }

    console.log('Successfully inserted patients into Supabase!');
    console.log(`Inserted ${data.length} records.`);
}

seed();
