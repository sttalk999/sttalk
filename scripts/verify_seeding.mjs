import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log('Verifying connection to:', supabaseUrl);

    // Check if we can read from european_investors
    const { error, count } = await supabase
        .from('european_investors')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Error connecting/reading:', error);
    } else {
        console.log('Connection successful!');
        console.log(`Found ${count} records in european_investors table.`);
    }
}

verify();
