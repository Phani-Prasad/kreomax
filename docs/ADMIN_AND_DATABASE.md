# Database and admin: setup guide

Enquiries and studio access codes live in a database. The **admin page only works on your own
computer**, and it talks to the same database the live website uses.

```
Student's phone ──> live website (Vercel) ──> backend on Render ──┐
                                                                   ├──> hosted database (Neon)
You on your computer ──> /admin ──> backend on your computer ─────┘
```

## One-time setup

### 1. Create a free hosted database (about 3 minutes)
1. Go to https://neon.tech and sign up (the free plan is enough).
2. Create a project (name it `kreomax`, pick the region closest to your users, for example Singapore or Mumbai).
3. On the project page, copy the **connection string**. It starts with `postgresql://` and ends with `?sslmode=require`.

> Supabase also works. Use its "Session pooler" connection string.

### 2. Tell the live backend about it (Render)
1. Render dashboard, your backend service, **Environment**.
2. Add `DATABASE_URL` and paste the connection string. Save (Render redeploys).
3. Do **not** add `ADMIN_LOCAL` or `ADMIN_API_TOKEN` on Render. With neither, admin routes are switched off on the live site.

The tables are created automatically on start. Check the Render logs for
`[Database] Using hosted database at ...`.

### 3. Tell your computer about it
In `backend/.env` (it is private and never pushed to GitHub) add the **same** line:

```
DATABASE_URL=postgresql://...your connection string...
ADMIN_LOCAL=1
```

## Everyday use: approving students

1. Start the backend on your computer: `cd backend`, then `python main.py`.
2. Start the website: `cd frontend`, then `npm run dev`.
3. Open http://localhost:5173/admin. No password is asked, because this is your computer.
4. **Requests** shows everyone who applied on the live site. Click **Approve**, then **Send on WhatsApp**.
   For someone who registered on WhatsApp, use **New access**.
5. To stop someone: **Access codes**, then **Switch off**.

## What is protected
- `/admin` does not exist in the public website (it is only built in development).
- On the live backend, admin routes answer "not available" even if someone finds the address.
- Admin routes also refuse anything that arrived through a proxy, so they cannot be reached through Render.
- The AI features only work for people holding a valid code.

## Troubleshooting
| Problem | Fix |
|---|---|
| Admin page says "only available on your own computer" | Check `ADMIN_LOCAL=1` is in `backend/.env` and restart the backend. |
| Admin shows no live requests | `DATABASE_URL` in `backend/.env` must be the same one Render uses. Without it your computer uses a separate local file. |
| Students get "That code is not valid" | They may have mistyped it. Look it up under **Access codes**, check it is Active. |

Your earlier enquiries from `leads_data.json` are copied into the database automatically the first time
it starts empty, and the old file is left untouched.
