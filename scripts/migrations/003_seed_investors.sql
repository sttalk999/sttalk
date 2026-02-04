-- Seed 5 European Investors
INSERT INTO european_investors (
    id, firm_name, website, hq_location, investment_focus, stages, investment_thesis, investor_type, min_check_size, max_check_size
) VALUES 
(
    gen_random_uuid(),
    '1st Course Capital',
    'https://www.1cc.vc/',
    'Redwood City, CA, USA',
    'USA',
    '2. Prototype, 3. Early Revenue, 4. Scaling',
    'We invest in business model and technology innovations across the food supply chain, from inputs and agriculture, through processing, distribution, retail, all the way to consumer health.',
    'VC',
    25000,
    200000
),
(
    gen_random_uuid(),
    'Twelve',
    'https://212angels.com',
    'Tiburon, CA, USA',
    'USA',
    '2. Prototype, 3. Early Revenue',
    'We invest in B2B,Enterprise, SaaS, B2B Fintech at seed stage.',
    'VC',
    100000,
    300000
),
(
    gen_random_uuid(),
    '3CC Third Culture Capital',
    'https://3cc.io',
    'Boston, MA, USA',
    'USA, France, Canada, Vietnam',
    '3. Early Revenue, 4. Scaling, 2. Prototype, 1. Idea or Patent',
    'We invest in diverse founders who innovate at the intersection of culture and healthcare delivery.',
    'VC',
    250000,
    2000000
),
(
    gen_random_uuid(),
    '3cubed VC',
    'https://3cubed.vc',
    'San Francisco, CA, USA',
    'USA, Germany, UK, UAE, Spain, South Africa, Tanzania, Liberia, Australia, Canada, Israel, Mexico',
    '1. Idea or Patent, 2. Prototype, 3. Early Revenue, 5. Growth',
    'We invest in AI, Fintech, Blockchain Tech, Enterprise Software, Consumer Internet, Health Tech.',
    'VC',
    50000,
    1000000
),
(
    gen_random_uuid(),
    '3one4 Capital',
    'https://www.3one4capital.com',
    'Bengaluru, India',
    'India, USA, Singapore',
    '2. Prototype, 3. Early Revenue, 4. Scaling',
    'We invest in SaaS, Enterprise & SMB Automation, Fintech, Consumer Internet, and Digital Health.',
    'VC',
    100000,
    5000000
);
