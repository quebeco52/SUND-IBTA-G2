DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS classifications CASCADE;

CREATE TABLE transactions (
    id               INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    transaction_date DATE NOT NULL,
    recipient        TEXT NOT NULL,
    amount           NUMERIC(12, 2) NOT NULL,
    classification   TEXT NOT NULL DEFAULT 'Unknown'
);

CREATE INDEX transactions_date_idx
    ON transactions (transaction_date);
CREATE INDEX transactions_classification_idx
    ON transactions (classification);

INSERT INTO transactions (transaction_date, recipient, amount, classification) VALUES
    ('2026-09-01', 'ICA',              -342.00,  'Food'),
    ('2026-09-02', 'SL',               -1060.00, 'Transport'),
    ('2026-09-04', 'Systembolaget',    -489.00,  'Entertainment'),
    ('2026-09-06', 'Apoteket Hjärtat', -179.00,  'Household'),
    ('2026-09-08', 'Telia',            -399.00,  'Household'),
    ('2026-09-10', 'H&M',              -599.00,  'Household'),
    ('2026-09-12', 'IKEA',             -1295.00, 'Household'),
    ('2026-09-14', 'Circle K',         -812.00,  'Transport'),
    ('2026-09-17', 'Max',              -189.00,  'Food'),
    ('2026-09-19', 'Elgiganten',       -2490.00, 'Entertainment');
