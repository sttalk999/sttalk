import fs from 'fs';
import csv from 'csv-parser';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const csvPath = path.resolve('public/investors.csv');

function cleanCurrency(value) {
    if (!value) return null;
    const cleanVal = value.replace(/[$,\s]/g, '');
    const num = parseFloat(cleanVal);
    return isNaN(num) ? null : num;
}

const results = [];

console.log(`Reading CSV from ${csvPath}...`);

let firstRow = true;
fs.createReadStream(csvPath)
    .pipe(csv())
    .on('data', (data) => {
        // Handle BOM in 'Investor name' or find the key that ends with 'Investor name'
        const nameKey = Object.keys(data).find(k => k.includes('Investor name'));
        const firmName = data[nameKey]?.trim();
        if (!firmName) return;

        // Mapping CSV columns to Database columns
        const mapped = {
            firm_name: firmName,
            website: data['Website']?.trim() || '',
            hq_location: data['Global HQ']?.trim() || '',
            investment_focus: data['Countries of investment']?.trim() || '',
            stages: data['Stage of investment']?.trim() || '',
            investment_thesis: data['Investment thesis']?.trim() || '',
            investor_type: data['Investor type']?.trim() || '',
            min_check_size: cleanCurrency(data['First cheque minimum']),
            max_check_size: cleanCurrency(data['First cheque maximum']),
        };
        results.push(mapped);
    })
    .on('end', async () => {
        console.log(`Read ${results.length} valid records. Deduping...`);

        // Simple dedupe
        const uniqueResults = [];
        const seen = new Set();
        for (const item of results) {
            const id = `${item.firm_name}-${item.website}`.toLowerCase();
            if (!seen.has(id)) {
                seen.add(id);
                uniqueResults.push(item);
            }
        }

        console.log(`Seeding ${uniqueResults.length} unique records into Supabase...`);

        const chunkSize = 50;
        let successCount = 0;
        for (let i = 0; i < uniqueResults.length; i += chunkSize) {
            const chunk = uniqueResults.slice(i, i + chunkSize);
            const { data, error } = await supabase
                .from('european_investors')
                .insert(chunk)
                .select();

            if (error) {
                console.error(`Error in chunk ${Math.floor(i / chunkSize)}:`, error.message, error.details);
            } else {
                successCount += chunk.length;
                console.log(`Inserted chunk ${Math.floor(i / chunkSize) + 1} / ${Math.ceil(uniqueResults.length / chunkSize)} (${successCount} total)`);
            }
        }

        console.log(`Seeding completed! Successfully inserted ${successCount} records.`);
    });
