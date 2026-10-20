DROP TABLE IF EXISTS transactions CASCADE; -- CASCADE tar bort allt som är beroende av tabellen också
DROP TABLE IF EXISTS classifications CASCADE;

CREATE TABLE classifications (
    id             INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    recipient      TEXT NOT NULL UNIQUE,
    category       TEXT NOT NULL
);

CREATE INDEX classifications_category_idx
    ON classifications (category);

CREATE TABLE transactions (
    id               INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    transaction_date DATE NOT NULL,
    classification_id INTEGER NOT NULL REFERENCES classifications (id),
    amount           NUMERIC(12, 2) NOT NULL -- 2 decimal precision
);

CREATE INDEX transactions_date_idx
    ON transactions (transaction_date);
CREATE INDEX transactions_classification_id_idx
    ON transactions (classification_id);

INSERT INTO classifications (recipient, category) VALUES
    ('ICA',              'Food'),
    ('SL',               'Transport'),
    ('Systembolaget',    'Entertainment'),
    ('Apoteket Hjärtat', 'Household'),
    ('Telia',            'Household'),
    ('H&M',              'Household'),
    ('IKEA',             'Household'),
    ('Circle K',         'Transport'),
    ('Max',              'Food'),
    ('Elgiganten',       'Household');

INSERT INTO transactions (transaction_date, classification_id, amount) VALUES
    ('2026-09-01', (SELECT id FROM classifications WHERE recipient = 'ICA'),              -342.00),
    ('2026-09-02', (SELECT id FROM classifications WHERE recipient = 'SL'),               -1060.00),
    ('2026-09-04', (SELECT id FROM classifications WHERE recipient = 'Systembolaget'),    -489.00),
    ('2026-09-06', (SELECT id FROM classifications WHERE recipient = 'Apoteket Hjärtat'), -179.00),
    ('2026-09-08', (SELECT id FROM classifications WHERE recipient = 'Telia'),            -399.00),
    ('2026-09-10', (SELECT id FROM classifications WHERE recipient = 'H&M'),              -599.00),
    ('2026-09-12', (SELECT id FROM classifications WHERE recipient = 'IKEA'),             -1295.00),
    ('2026-09-14', (SELECT id FROM classifications WHERE recipient = 'Circle K'),         -812.00),
    ('2026-09-17', (SELECT id FROM classifications WHERE recipient = 'Max'),              -189.00),
    ('2026-09-19', (SELECT id FROM classifications WHERE recipient = 'Elgiganten'),       -2490.00);
