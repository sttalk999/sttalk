import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

const { Client } = pkg;
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.DATABASE_URL;

if (!supabaseUrl || !supabaseKey || !databaseUrl) {
    console.error('Missing Supabase credentials or DATABASE_URL in .env.local');
    process.exit(1);
}

const client = new Client({
    connectionString: databaseUrl,
    ssl: {
        rejectUnauthorized: false
    }
});

async function applyMigration() {
    const sqlPath = path.resolve('scripts/migrations/001_create_tables.sql');
    console.log(`Reading migration from ${sqlPath}...`);

    if (!fs.existsSync(sqlPath)) {
        console.error(`Migration file not found at ${sqlPath}`);
        process.exit(1);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');

    try {
        await client.connect();
        console.log('Connected to database. Applying migration...');

        // Execute the SQL
        await client.query(sql);

        console.log('Migration applied successfully!');
    } catch (err) {
        console.error('Error applying migration:', err);
    } finally {
        await client.end();
    }
}

applyMigration();
