import pandas as pd
from sqlalchemy import create_engine, text
import os
import re
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv('.env.local')

# Database connection URL from environment variable
DB_URL = os.getenv('DATABASE_URL')

if not DB_URL:
    print("Error: DATABASE_URL not found in environment variables.")
    print("Please set DATABASE_URL in your .env.local file.")
    print("Format: postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres")
    exit(1)

def clean_currency(value):
    if pd.isna(value) or value == '':
        return None
    # Remove $, commas, and whitespace
    clean_val = re.sub(r'[$,\s]', '', str(value))
    try:
        return float(clean_val)
    except ValueError:
        return None

def seed():
    engine = create_engine(DB_URL)
    csv_path = "public/investors.csv"
    
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found!")
        return

    print(f"Reading CSV from {csv_path}...")
    df = pd.read_csv(csv_path)
    
    # Mapping CSV columns to Database columns
    mapping = {
        'Investor name': 'firm_name',
        'Website': 'website',
        'Global HQ': 'hq_location',
        'Countries of investment': 'investment_focus',
        'Stage of investment': 'stages',
        'Investment thesis': 'investment_thesis',
        'Investor type': 'investor_type',
        'First cheque minimum': 'min_check_size',
        'First cheque maximum': 'max_check_size'
    }
    
    df = df.rename(columns=mapping)
    
    # Cleaning
    print("Normalizing data...")
    df = df.drop_duplicates(subset=['firm_name', 'website'], keep='first')
    df['min_check_size'] = df['min_check_size'].apply(clean_currency)
    df['max_check_size'] = df['max_check_size'].apply(clean_currency)
    
    # Trim strings and handle nulls
    for col in df.select_dtypes(include=['object']).columns:
        df[col] = df[col].str.strip().fillna('')

    print(f"Inserting {len(df)} records into 'european_investors'...")
    # Using method='multi' for faster batch insertion if supported, 
    # but default to_sql is usually fine for 1MB.
    df.to_sql('european_investors', engine, if_exists='append', index=False)
    
    with engine.connect() as conn:
        result = conn.execute(text("SELECT COUNT(*) FROM european_investors"))
        count = result.scalar()
        print(f"Success! Total records in 'european_investors': {count}")

if __name__ == "__main__":
    seed()
