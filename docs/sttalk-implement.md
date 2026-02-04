# Implementation Guide: STARTUP TALKING
**"From Vision To Velocity"**

This document outlines the architecture, design, and implementation steps for building the STARTUP TALKING platform.

---

## 1. Visual Identity & Brand System

### Color Palette
- **Background**: `#F5F0E6` (Warm Beige) - *Main application background*
- **Primary Text**: `#4A3F35` (Espresso Brown) - *High contrast for readability*
- **Secondary Text**: `#8B7E74` (Taupe) - *Subtle descriptive text*
- **Accent/CTA**: `#FFA500` (Gold/Amber) - *Buttons, highlights, and the stylized "A"*
- **Surface**: `#FFFFFF` (White) - *Cards and modals with subtle shadows*

### Typography
- **Headings**: `Outfit` or `Inter` (Bold/Semibold) - *Modern, professional feel*
- **Body**: `Inter` (Regular) - *Clean and legible for data-heavy views*

### UI Styling Rules
- **The Stylized "A"**: The "A" in STARTUP T**A**LKING uses the Accent color and a slightly more geometric weight.
- **Glassmorphism**: Use subtle background blur (`backdrop-blur-md`) on sticky navbars and modals.
- **Micro-interactions**: 
  - Hovering over an investor card should trigger a slight scale-up (`scale-[1.02]`) and a deeper shadow.
  - CTAs should have a pulse animation or a smooth color transition on hover.

### Speech Bubble UI
Messaging and notifications use a custom "Speech Bubble" container:
- **Investor Messages**: Left-aligned, Espresso Brown text on White background with a small Gold speech tail.
- **Startup Messages**: Right-aligned, White text on Gold background with a small Espresso speech tail.
- **Icons**: Use `Lucide-React` with Gold strokes for speech bubbles, search, and handshakes.

---

## 2. Core UI Components

### 2.1 Hero Section (The "Vision to Velocity" Entry)
- **Visual**: A large, centered headline with the stylized Gold "A".
- **CTA**: "Get Funded" (Gold Button) and "Find Startups" (Outline Brown Button).
- **Background**: Subtle abstract topographic lines in Taupe.

### 2.2 European Investor Card
- **Layout**: Horizontal card for desktop, vertical for mobile.
- **Elements**:
  - Logo placeholder (top left).
  - Title: Firm Name.
  - Badges: Sector (e.g., "Fintech"), Stage (e.g., "Seed").
  - Hidden Detail: Thesis teaser (blurry/truncated for non-paying entities).
  - Action: "Request Intro" (Speech Bubble Icon).

### 2.3 Real-time Chat Interface
- **Sidebar**: List of active "Matches" with status indicators.
- **Main Area**: Speech bubble stream.
- **Footer**: Input field with "Send" button as a stylized gold paper plane or speech icon.

---

## 3. User Flows (Mermaid Architecture)

```mermaid
graph TD
    A[Public Visitor] -->|Browse| B[Investor Directory]
    B -->|Click Card| C{Authenticated?}
    C -->|No| D[Clerk Sign In/Up]
    C -->|Yes| E[Profile Dashboard]
    E -->|Upload Deck| F[AI Matchmaking Engine]
    F -->|Match Found| G[Match Connection - Pending]
    G -->|Mutual Interest| H[Speech Bubble Messaging]
end
```

---

## 4. Business Model & User Roles

**Model**: B2B Matchmaking under 2026 India-EU FTA.
- **Indian Entities (Paying)**: Startups, entrepreneurs, businesses.
- **European Investors (Free)**: Access to drive network effects and deal flow.

---

## 3. Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS v4, TypeScript.
- **Auth**: Clerk (Existing setup).
- **Database**: Supabase / PostgreSQL (Existing setup).
- **Real-time**: Supabase Realtime for messaging and notifications.
- **File Storage**: Supabase Storage for pitch decks and PDFs.

---

## 4. Database Schema (Supabase/Prisma)

### Tables to Create:
1. **Profiles**:
   - `id`: UUID (linked to Clerk userId)
   - `role`: enum (`IndianEntity`, `EuropeanInvestor`, `Admin`)
   - `displayName`: string
   - `bio`: text
2. **IndianEntities**:
   - `id`: UUID (linked to Profile)
   - `companyName`: string
   - `location`: string (for verification)
   - `compliancePackage`: enum (`PackageA`, `PackageB`, `None`)
   - `pitchDeckUrl`: string
3. **EuropeanInvestors**:
   - `id`: UUID (linked to Profile)
   - `firmName`: string
   - `investmentFocus`: string
   - `stages`: string
   - `sectors`: string
   - `minCheckSize`: decimal
   - `maxCheckSize`: decimal
4. **Matches**:
   - `id`: UUID
   - `indianEntityId`: UUID
   - `investorId`: UUID
   - `status`: enum (`Pending`, `TeaserRevealed`, `FullReveal`, `Connected`)
5. **Messages**:
   - `id`: UUID
   - `matchId`: UUID
   - `senderId`: UUID
   - `content`: text
   - `createdAt`: timestamp

---

## 5. Implementation Steps

### Phase 1: Brand & Theme
- Update global CSS/Tailwind variables to match the beige/brown/gold palette.
- Create common UI components (Button, Input, Card) using the brand colors.
- Design the "Speech Bubble" icon set.

### Phase 2: Database Seeding (Critical)
Run the following Python script to seed the initial investor database from `public/investors.csv`:

```python
import pandas as pd
from sqlalchemy import create_engine, text
import os

# Update with your Supabase Connection String
DB_URL = "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" 

engine = create_engine(DB_URL)
csv_path = "public/investors.csv"

df = pd.read_csv(csv_path)

# Cleaning
df = df.drop_duplicates(subset=['Email', 'FirmName'], keep='first')
df = df.fillna('')

# Normalizing
df['InvestmentFocus'] = df['InvestmentFocus'].str.lower().str.strip()
df['Stages'] = df['Stages'].str.lower().str.strip()
df['Sectors'] = df['Sectors'].str.lower().str.strip()

# Insert
df.to_sql('european_investors', engine, if_exists='append', index=False)

with engine.connect() as conn:
    result = conn.execute(text("SELECT COUNT(*) FROM european_investors"))
    print(f"Seeded {result.scalar()} European investors.")
```

### Phase 3: Indian Entity Onboarding
- Build the profile builder and location verification step.
- Implement the "FTA Product Mapping Tool" mock/logic.
- Display "Compliance Packages" information.

### Phase 4: Investor Directory & Matchmaking
- Build the public (no login) search view for European Investors.
- Implement the "Deal Flow Engine" logic:
  - Upload Pitch Deck -> Auto-match based on Sector/Stage -> Notify Investor.

### Phase 5: Real-time Messaging
- Implement Supabase Realtime for live message updates.
- Build the messaging UI using the orange-accented speech bubble design.

### Phase 6: Admin Dashboard
- Track signups, entity-investor matches, and platform activity.
