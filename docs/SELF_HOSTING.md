# Self-Hosting Monarch Gallery

Complete guide to deploy and host Monarch Gallery independently from Lovable.

---

## Prerequisites

- Node.js 18+ installed
- Git installed
- A Supabase account (free tier available)
- A hosting provider account (Vercel, Netlify, or similar)
- Domain name (optional)

---

## Step 1: Export Code from Lovable

### Option A: GitHub Sync (Recommended)

1. In Lovable, go to **Project Settings → GitHub → Connect Project**
2. Authorize Lovable's GitHub App
3. Click **Create Repository** to push code to GitHub
4. Clone the repository locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
   cd YOUR_REPO
   ```

### Option B: Manual Download

1. In Lovable, switch to **Code Editor View**
2. Download files manually or copy the code
3. Create a new local project with the same structure

---

## Step 2: Set Up Supabase (Backend)

Since the project uses Lovable Cloud (Supabase under the hood), you need your own Supabase project.

### Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click **New Project**
3. Choose organization, name, password, and region
4. Wait for project to be created (~2 minutes)

### Migrate Database Schema

1. In Lovable, go to **Cloud View → Database**
2. Export your schema (or use the migrations in `supabase/migrations/`)
3. In Supabase Dashboard, go to **SQL Editor**
4. Run each migration file in order

Or use Supabase CLI:
```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push
```

### Get Your Credentials

From Supabase Dashboard → **Settings → API**:
- **Project URL**: `https://xxxxx.supabase.co`
- **Anon/Public Key**: `eyJhbGciOiJIUzI1NiIs...`
- **Service Role Key**: (Keep secret, for admin operations)

### Configure Authentication

1. Go to **Authentication → Providers**
2. Enable **Email** provider
3. Configure email templates (optional)
4. For wallet auth, no additional setup needed

### Set Up Storage

1. Go to **Storage** in Supabase Dashboard
2. Create bucket named `artworks` (public)
3. RLS policies are already in migrations

---

## Step 3: Configure Environment Variables

Create `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
```

**Important**: Never commit `.env` to Git. Add it to `.gitignore`:
```
.env
.env.local
.env.*.local
```

---

## Step 4: Update Supabase Client

The file `src/integrations/supabase/client.ts` reads from environment variables:

```typescript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
```

This should work automatically with your `.env` file.

---

## Step 5: Build the Project

```bash
# Install dependencies
npm install

# Run development server (to test locally)
npm run dev

# Build for production
npm run build
```

The build output will be in the `dist/` folder.

---

## Step 6: Deploy Frontend

### Option A: Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign up
3. Click **Import Project** → Select your GitHub repo
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
6. Click **Deploy**

### Option B: Netlify

1. Go to [netlify.com](https://netlify.com) and sign up
2. Click **Add new site** → **Import from Git**
3. Select your GitHub repo
4. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Add Environment Variables in **Site settings → Build & deploy → Environment**
6. Deploy

### Option C: Self-Hosted (VPS/Server)

1. Build the project locally:
   ```bash
   npm run build
   ```

2. Upload `dist/` folder to your server

3. Configure Nginx:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       root /var/www/monarch-gallery/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Cache static assets
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

4. Set up SSL with Let's Encrypt:
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

---

## Step 7: Configure Custom Domain

### For Vercel/Netlify

1. Go to project settings → Domains
2. Add your custom domain
3. Configure DNS at your registrar:
   - **A Record**: Point to provider's IP
   - **CNAME**: Point `www` to your deployment URL

### For Self-Hosted

1. Point your domain's A record to your server IP
2. Configure Nginx with your domain name
3. Set up SSL certificate

---

## Step 8: Security Checklist

### Environment Variables
- [ ] Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend
- [ ] Only use `VITE_` prefixed variables in frontend code
- [ ] Keep production `.env` files secure

### Supabase Security
- [ ] Enable RLS on all tables (already configured)
- [ ] Review RLS policies match your access requirements
- [ ] Enable email confirmation for signups
- [ ] Set strong password requirements

### Production Hardening
- [ ] Enable HTTPS (SSL certificate)
- [ ] Set up proper CORS in Supabase
- [ ] Configure rate limiting (Supabase handles this)
- [ ] Set up monitoring/error tracking (Sentry, etc.)

### Content Security
- [ ] DOMPurify is installed for HTML sanitization
- [ ] Input validation on all forms
- [ ] File upload restrictions in place

---

## Step 9: Edge Functions (Optional)

If you have Supabase Edge Functions in `supabase/functions/`:

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login and link:
   ```bash
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. Deploy functions:
   ```bash
   supabase functions deploy
   ```

---

## Step 10: Data Migration

### Export Data from Lovable Cloud

1. In Lovable, go to **Cloud View → Database → Tables**
2. Select each table and click **Export**
3. Download as CSV or JSON

### Import to Your Supabase

1. In Supabase Dashboard, go to **Table Editor**
2. Select table → **Import Data**
3. Upload your exported files

Or use SQL:
```sql
-- Example: Import from CSV
COPY artists FROM '/path/to/artists.csv' WITH CSV HEADER;
```

---

## Ongoing Maintenance

### Database Backups
- Supabase provides automatic daily backups (Pro plan)
- For free tier, export data regularly

### Updates
```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Rebuild
npm run build

# Deploy (varies by host)
```

### Monitoring
- Set up Supabase Logs monitoring
- Use error tracking (Sentry, LogRocket)
- Monitor uptime (UptimeRobot, Pingdom)

---

## Cost Estimates

| Service | Free Tier | Paid |
|---------|-----------|------|
| Supabase | 500MB DB, 1GB storage | $25/mo Pro |
| Vercel | 100GB bandwidth | $20/mo Pro |
| Netlify | 100GB bandwidth | $19/mo Pro |
| Domain | - | $10-15/year |

**Total for small site**: Free to ~$50/month depending on traffic.

---

## Troubleshooting

### "Cannot connect to Supabase"
- Verify environment variables are correct
- Check Supabase project is running
- Verify anon key permissions

### "CORS errors"
- In Supabase → Settings → API → Add your domain to allowed origins

### "Auth not working"
- Check redirect URLs in Supabase Auth settings
- Verify email provider is enabled

### "Storage uploads fail"
- Check bucket exists and is public
- Verify RLS policies allow uploads

---

## Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)
- [Vercel Documentation](https://vercel.com/docs)
- [React Documentation](https://react.dev)
