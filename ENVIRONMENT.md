Environment variables (.env)

This project uses environment variables to configure the database, JWT secrets, and other runtime settings.

1) Create your local `.env`

- Copy the example file and fill real values:
  - PowerShell:

    ```powershell
    Copy-Item .env.example .env
    ```

  - macOS / Linux:

    ```bash
    cp .env.example .env
    ```

- Edit `.env` with a secure editor and fill in real credentials.

2) What variables to set

See `.env.example` — the project expects (examples):

- Database: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
- App: `PORT`, `NODE_ENV`, `PROD`
- JWT: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRESIN`, `JWT_REFRESH_EXPIRESIN`
- Links / email: `RESET_PASSWORD_URL` (and any SMTP / S3 secrets)

3) Run the app locally

- PowerShell:

```powershell
# Copy example to .env (only once)
Copy-Item .env.example .env
# Edit .env and then start in dev mode
npm run start:dev
```

- macOS / Linux:

```bash
cp .env.example .env
npm run start:dev
```

4) Avoid committing secrets

- `.env` is already listed in `.gitignore` in this repository. Do NOT commit it.
- If you accidentally committed secrets, remove them and rotate the keys. Example:

```bash
# Stop tracking .env and commit the change
git rm --cached .env
git commit -m "Remove local .env from repo"
# Push and rotate any compromised secrets (DB passwords, JWT secrets...)
```

5) Optional: automatic loading of `.env`

- If you want the app to automatically load `.env`, install `dotenv`:

```bash
npm install dotenv
```

- Then add this very early in your bootstrap (e.g. `src/main.ts`):

```ts
require('dotenv').config();
```

I can add dotenv integration to `src/main.ts` if you want — tell me and I will implement it.

---

If you want, I can also add a small pointer in `README.md` to this file (I didn't modify the original README to avoid altering its code-fenced content). Would you like me to add that pointer now?