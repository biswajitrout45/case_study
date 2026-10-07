# Northstar ERP

Customer enquiries, industrial product catalogue, inventory management, and sales-order reservation demo.

## Documentation

See [Documentation](./Documentation) for the full project guide covering architecture, setup, API routes, workflows, and database configuration.

## Run locally

1. Start the API:

   ```powershell
   cd Backend
   npm install
   npm run dev
   ```

2. Start the web app in a second terminal:

   ```powershell
   cd Frontend/case_study_fundsroom
   npm install
   npm run dev
   ```

The API uses `http://localhost:5000` by default. Set `VITE_API_URL` in the frontend environment to use a different API origin.

## Database

PostgreSQL is optional for local evaluation. With no database configuration, the API uses in-memory demo data, which is reset when the backend restarts. For PostgreSQL, configure `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, optionally `DB_PORT`, and `JWT_SECRET` in the backend environment, create the database, and apply `Database/schema.sql`.

The schema seeds six industrial products and opening inventory. The first account registered in an empty workspace becomes its administrator; subsequent accounts are standard sales users. Passwords are hashed before storage.

To create or update the named administrator and demote all other admins, apply `Database/seed.sql` with `psql` after `schema.sql`. Set the desired admin password in `NORTHSTAR_ADMIN_PASSWORD` in the local shell first; the seed hashes it with PostgreSQL `pgcrypto` and does not store the plaintext password in the SQL file. The script is safe to rerun.

Only administrators can add products, adjust physical stock, and confirm sales orders. Confirming an order reserves stock without reducing physical quantity. PostgreSQL confirmation runs inside a transaction and uses a conditional row update (`physical_quantity - reserved_quantity >= requested_quantity`) so concurrent confirmations cannot oversell. Database checks also prevent negative quantities and reservations above physical stock.

## Validation

```powershell
cd Backend
npm test
cd ../Frontend/case_study_fundsroom
npm run build
```