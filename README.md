# 8WAVES CONNECT

A futuristic class hub with two channels:

- **OSTOTORONGO** — the classmate directory. Anyone can submit their own
  details or request a change to their existing profile, but nothing appears
  publicly until an **admin approves it**.
- **FACULTY** — a roster that only the admin can add to or edit.

Built with **Next.js (App Router)**, **MongoDB**, and plain CSS. Ready to
deploy on **Vercel**.

---

## 1. Project structure

```
app/
  page.js                  Frontpage (hero + channel picker)
  ostotorongo/page.js       Public classmate directory (approved only)
  ostotorongo/submit/page.js  Submission / update form
  faculty/page.js           Public faculty roster
  admin/page.js              Admin login + dashboard (queue, classmates, faculty)
  api/
    students/route.js        GET (public list / admin "all"), POST (submit)
    students/[id]/route.js   PATCH (approve/reject/edit, admin), DELETE (admin)
    faculty/route.js         GET (public), POST (admin only)
    faculty/[id]/route.js    PATCH/DELETE (admin only)
    admin/login/route.js     Admin sign-in, sets an httpOnly session cookie
    admin/logout/route.js
    admin/me/route.js        Session check
models/                     Mongoose schemas: Student, Faculty, Admin
lib/mongodb.js               Cached DB connection (serverless-safe)
lib/auth.js                  JWT session helpers
scripts/seed-admin.js        Creates/updates the admin account
```

## 2. How the approval workflow works

1. A classmate fills out the form at `/ostotorongo/submit`, either as a
   **new profile** or as an **update to their existing (already approved)
   profile**.
2. Every submission is saved with `status: "pending"` and is never returned
   by the public `GET /api/students` endpoint.
3. The admin reviews the pending queue at `/admin`:
   - **Approve** a new profile → it becomes `status: "approved"` and shows
     up in the directory.
   - **Approve** an update request → the changes are copied onto the
     original approved profile, and the pending request is removed.
   - **Reject** → the submission is marked `rejected` and stays hidden.
4. The admin can also directly edit or delete any classmate profile, and is
   the only one who can add, edit, or delete Faculty entries.

## 3. Local setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

```
MONGODB_URI=mongodb+srv://user:password@cluster0.xxxx.mongodb.net/8waves?retryWrites=true&w=majority
JWT_SECRET=some-long-random-string
ADMIN_USERNAME=admin
ADMIN_PASSWORD=choose-a-strong-password
```

Create the admin account (run once, and again any time you want to change
the password):

```bash
npm run seed:admin
```

Start the dev server:

```bash
npm run dev
```

Visit `http://localhost:3000`, and sign in at `/admin` with the credentials
you set above.

## 4. Setting up MongoDB (Atlas, free tier is enough)

1. Create a free cluster at https://www.mongodb.com/cloud/atlas.
2. Under **Database Access**, create a database user with a password.
3. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) so
   Vercel's serverless functions can connect.
4. Under **Database > Connect > Drivers**, copy the connection string and
   put it in `MONGODB_URI` (both locally in `.env.local` and later in
   Vercel's environment variables). Add a database name at the end of the
   path, e.g. `.../8waves?retryWrites=true...`.

## 5. Deploying to Vercel

1. Push this project to a GitHub repository.
2. Go to https://vercel.com/new and import the repository.
3. In **Environment Variables**, add:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
4. Deploy.
5. Create the admin account against your production database. Easiest way:
   run the seed script locally once, pointed at the same `MONGODB_URI` you
   used in Vercel (put it in your local `.env.local` temporarily), since the
   script just needs network access to that MongoDB cluster:
   ```bash
   npm run seed:admin
   ```
6. Visit `https://your-project.vercel.app/admin` and sign in.

No further backend setup is needed — MongoDB is fully managed and Vercel
builds the Next.js app (frontend, API routes, and all) as one deployment.

## 6. Notes / things you may want to customize

- **Images**: profile photos are stored as plain URLs (e.g. a Google Drive
  or Imgur link), not file uploads. If you want real file uploads, hook in
  a storage service like Vercel Blob or Cloudinary in the submit form.
- **Admin accounts**: this is set up for a single admin. To support several
  admins, add more documents to the `Admin` collection (via a script or a
  small `POST /api/admin/create` you protect carefully).
- **Rate limiting / spam**: the submission form is public and unauthenticated
  by design (classmates don't need accounts). Consider adding a simple
  CAPTCHA or honeypot field if spam becomes a problem.
