import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Database } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';

interface CSVRow {
  'Investor name': string;
  'Website': string;
  'Global HQ': string;
  'Countries of investment': string;
  'Stage of investment': string;
  'Investment thesis': string;
  'Investor type': string;
  'First cheque minimum': string;
  'First cheque maximum': string;
}

type InvestorInsert = Database['public']['Tables']['european_investors']['Insert'];

export async function POST(request: Request) {
  try {
    // Check for admin secret (simple auth)
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (secret !== process.env.ADMIN_SEED_SECRET && secret !== 'seed-investors-2026') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerSupabaseClient();
    const csvPath = path.join(process.cwd(), 'public', 'investors.csv');

    if (!fs.existsSync(csvPath)) {
      return NextResponse.json({ error: 'CSV file not found' }, { status: 404 });
    }

    const investors: InvestorInsert[] = [];

    // Helper to get value by key name (handles BOM prefix)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getValue = (row: any, keyName: string): string => {
      // Try exact match first
      if (row[keyName] !== undefined) return row[keyName];
      // Find key that ends with the keyName (handles BOM prefix)
      const key = Object.keys(row).find(k => k.endsWith(keyName) || k.includes(keyName));
      return key ? row[key] : '';
    };

    const parseNumber = (val: string): number | null => {
      if (!val) return null;
      const cleaned = val.replace(/[$,]/g, '');
      const num = parseInt(cleaned, 10);
      return isNaN(num) ? null : num;
    };

    // Parse CSV
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csvParser())
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .on('data', (row: any) => {
          const firmName = getValue(row, 'Investor name');

          investors.push({
            firm_name: firmName,
            website: getValue(row, 'Website'),
            hq_location: getValue(row, 'Global HQ'),
            investment_focus: getValue(row, 'Countries of investment'),
            stages: getValue(row, 'Stage of investment'),
            investment_thesis: getValue(row, 'Investment thesis'),
            investor_type: getValue(row, 'Investor type'),
            min_check_size: parseNumber(getValue(row, 'First cheque minimum')),
            max_check_size: parseNumber(getValue(row, 'First cheque maximum')),
          });
        })
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });

    // Filter out empty firm names
    const validInvestors = investors.filter(inv => inv.firm_name && inv.firm_name.trim() !== '');

    // Clear existing data (optional - comment out if you want to append)
    await supabase.from('european_investors').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Insert in batches of 100
    const batchSize = 100;
    let inserted = 0;
    let errors = 0;
    let firstError: string | null = null;

    for (let i = 0; i < validInvestors.length; i += batchSize) {
      const batch = validInvestors.slice(i, i + batchSize);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.from('european_investors').insert(batch as any);

      if (error) {
        console.error(`Batch ${i / batchSize} error:`, error);
        if (!firstError) {
          firstError = error.message || JSON.stringify(error);
        }
        errors++;
      } else {
        inserted += batch.length;
      }
    }

    return NextResponse.json({
      success: errors === 0,
      message: `Seeded ${inserted} investors from CSV`,
      total: validInvestors.length,
      inserted,
      errors,
      firstError,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed investors', details: String(error) }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const debug = searchParams.get('debug');

  if (debug === 'true') {
    const csvPath = path.join(process.cwd(), 'public', 'investors.csv');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = [];

    await new Promise<void>((resolve) => {
      fs.createReadStream(csvPath)
        .pipe(csvParser())
        .on('data', (row) => {
          if (rows.length < 3) {
            rows.push({ keys: Object.keys(row), sample: row });
          }
        })
        .on('end', () => resolve());
    });

    return NextResponse.json({ debug: true, firstRows: rows });
  }

  return NextResponse.json({
    message: 'POST to this endpoint with ?secret=seed-investors-2026 to seed investor data. Use ?debug=true to see CSV structure.',
  });
}
