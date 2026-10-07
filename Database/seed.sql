
\getenv seed_admin_password NORTHSTAR_ADMIN_PASSWORD

SELECT CASE
    WHEN length(:'seed_admin_password') >= 6 THEN 'true'
    ELSE 'false'
END AS seed_password_valid
\gset

\if :seed_password_valid
\else
\echo 'NORTHSTAR_ADMIN_PASSWORD must be set and contain at least 6 characters.'
\quit 3
\endif

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

UPDATE users
SET role = 'SALES_USER'
WHERE role = 'ADMIN'
  AND LOWER(email) <> LOWER('routbiswajit475@gmail.com');

UPDATE users
SET name = 'Biswajit Rout',
    email = 'routbiswajit475@gmail.com',
    password_hash = crypt(:'seed_admin_password', gen_salt('bf', 12)),
    role = 'ADMIN'
WHERE LOWER(email) = LOWER('routbiswajit475@gmail.com');

INSERT INTO users (name, email, password_hash, role)
SELECT
    'Biswajit Rout',
    'routbiswajit475@gmail.com',
    crypt(:'seed_admin_password', gen_salt('bf', 12)),
    'ADMIN'
WHERE NOT EXISTS (
    SELECT 1
    FROM users
    WHERE LOWER(email) = LOWER('routbiswajit475@gmail.com')
);

COMMIT;