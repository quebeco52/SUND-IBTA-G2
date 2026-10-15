DROP TABLE IF EXISTS transactions CASCADE; -- CASCADE tar bort allt som är beroende av tabellen också
DROP TABLE IF EXISTS classifications CASCADE;

CREATE TABLE classifications (
    recipient       TEXT PRIMARY KEY,
    classification  TEXT NOT NULL
);

CREATE INDEX classifications_classification_idx
    ON classifications (classification);

CREATE TABLE transactions (
    id                INTEGER PRIMARY KEY,
    transaction_date  DATE NOT NULL,
    recipient         TEXT NOT NULL,
    amount            INTEGER NOT NULL,
    CONSTRAINT transactions_recipient_fkey
        FOREIGN KEY (recipient) REFERENCES classifications (recipient)
);

CREATE INDEX transactions_date_idx
    ON transactions (transaction_date);

INSERT INTO classifications (recipient, classification) VALUES
    ('ICA',              'Food'),
    ('SL',               'Transport'),
    ('Systembolaget',    'Alcohol'),
    ('Apoteket Hjärtat', 'Health'),
    ('Telia',            'Telecom'),
    ('H&M',              'Clothing'),
    ('IKEA',             'Furniture'),
    ('Circle K',         'Fuel'),
    ('Max',              'Restaurants'),
    ('Elgiganten',       'Electronics');

INSERT INTO transactions (id, transaction_date, recipient, amount) VALUES
    (1,  '2026-09-01', 'ICA',               -342),
    (2,  '2026-09-02', 'SL',                -1060),
    (3,  '2026-09-04', 'Systembolaget',     -489),
    (4,  '2026-09-06', 'Apoteket Hjärtat',  -179),
    (5,  '2026-09-08', 'Telia',             -399),
    (6,  '2026-09-10', 'H&M',               -599),
    (7,  '2026-09-12', 'IKEA',              -1295),
    (8,  '2026-09-14', 'Circle K',          -812),
    (9,  '2026-09-17', 'Max',               -189),
    (10, '2026-09-19', 'Elgiganten',        -2490);