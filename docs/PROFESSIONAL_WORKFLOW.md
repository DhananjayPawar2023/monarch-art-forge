# Professional Development Workflow

How enterprise teams maintain and update production websites.

---

## Overview: The Professional Update Cycle

```
┌─────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT WORKFLOW                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Feature Request → Branch → Develop → Test → Review → Deploy│
│                                                              │
│   ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐ │
│   │ main │───►│branch│───►│ test │───►│  PR  │───►│deploy│ │
│   └──────┘    └──────┘    └──────┘    └──────┘    └──────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 1: Set Up GitHub Repository

### Connect Lovable to GitHub

1. Go to **Project Settings → GitHub → Connect Project**
2. Create repository
3. All changes now sync automatically

### Clone Locally

```bash
git clone https://github.com/YOUR_USERNAME/monarch-gallery.git
cd monarch-gallery
npm install
```

---

## Step 2: Branching Strategy

### Git Flow (Enterprise Standard)

```
main (production)
  │
  ├── develop (staging)
  │     │
  │     ├── feature/add-auction-system
  │     ├── feature/improve-search
  │     └── fix/checkout-bug
  │
  └── hotfix/critical-security-fix
```

### Branch Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/description` | `feature/add-dark-mode` |
| Bug Fix | `fix/description` | `fix/login-redirect` |
| Hotfix | `hotfix/description` | `hotfix/security-patch` |
| Release | `release/version` | `release/v2.0.0` |

### Create a Feature Branch

```bash
# Always start from main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/new-gallery-filter

# Work on your changes...
```

---

## Step 3: Development Workflow

### Local Development

```bash
# Start dev server
npm run dev

# Make changes and test locally
# Browser auto-refreshes at http://localhost:5173
```

### Commit Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add medium filter to gallery page

- Add filter dropdown component
- Connect to Supabase query
- Add loading states"
```

### Commit Message Format (Conventional Commits)

```
type(scope): description

feat:     New feature
fix:      Bug fix
docs:     Documentation
style:    Formatting (no code change)
refactor: Code restructure
test:     Adding tests
chore:    Maintenance
```

---

## Step 4: Code Review (Pull Requests)

### Push and Create PR

```bash
# Push branch to GitHub
git push origin feature/new-gallery-filter
```

Then on GitHub:
1. Click **"Compare & pull request"**
2. Write description of changes
3. Request reviewers
4. Link related issues

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Added unit tests
- [ ] Tested on mobile

## Screenshots
(if applicable)
```

### Code Review Checklist

- [ ] Code follows project style guide
- [ ] No console.logs or debug code
- [ ] Loading states for async actions
- [ ] Error handling in place
- [ ] Mobile responsive
- [ ] Accessibility considered

---

## Step 5: Automated Testing (CI/CD)

### GitHub Actions Workflow

Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run typecheck
      
      - name: Lint
        run: npm run lint
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build

  deploy-preview:
    needs: test
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # Deploy to preview URL (Vercel/Netlify handle this automatically)

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # Deploy to production
```

### Add Scripts to package.json

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src --ext .ts,.tsx",
    "typecheck": "tsc --noEmit"
  }
}
```

---

## Step 6: Environment Management

### Multiple Environments

| Environment | Purpose | URL |
|-------------|---------|-----|
| Development | Local testing | localhost:5173 |
| Staging | Pre-production testing | staging.yourdomain.com |
| Production | Live site | yourdomain.com |

### Environment Variables

```bash
# .env.development
VITE_SUPABASE_URL=https://dev-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=dev_key

# .env.staging
VITE_SUPABASE_URL=https://staging-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=staging_key

# .env.production
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=prod_key
```

### Separate Supabase Projects

For enterprise setups:
- **Dev Supabase**: For development/testing
- **Staging Supabase**: Mirror of production for testing
- **Production Supabase**: Live data

---

## Step 7: Release Process

### Semantic Versioning

```
MAJOR.MINOR.PATCH
  │     │     │
  │     │     └── Bug fixes (1.0.1)
  │     └──────── New features (1.1.0)
  └────────────── Breaking changes (2.0.0)
```

### Create a Release

```bash
# Update version in package.json
npm version minor -m "Release v%s"

# Push with tags
git push origin main --tags
```

### GitHub Releases

1. Go to **Releases** on GitHub
2. Click **"Draft a new release"**
3. Choose tag (e.g., v1.2.0)
4. Write release notes
5. Publish

### Release Notes Template

```markdown
## v1.2.0 - 2025-02-05

### ✨ New Features
- Added auction system for artworks
- New gallery filtering by medium

### 🐛 Bug Fixes
- Fixed checkout redirect issue
- Resolved mobile menu animation

### 🔧 Improvements
- Improved page load performance
- Better error messages

### ⚠️ Breaking Changes
- None
```

---

## Step 8: Deployment Strategy

### Blue-Green Deployment

```
┌─────────────────────────────────────────┐
│           Load Balancer                  │
│                 │                        │
│     ┌───────────┴───────────┐           │
│     ▼                       ▼           │
│ ┌───────┐               ┌───────┐       │
│ │ Blue  │ (current)     │ Green │ (new) │
│ │ v1.0  │               │ v1.1  │       │
│ └───────┘               └───────┘       │
│                                         │
│ Switch traffic: Blue → Green            │
│ Rollback if issues: Green → Blue        │
└─────────────────────────────────────────┘
```

### Vercel/Netlify Auto-Deploy

These platforms handle this automatically:
- **Preview deploys** for every PR
- **Production deploy** when merged to main
- **Instant rollback** to any previous deploy

---

## Step 9: Database Migrations

### Migration Workflow

```bash
# Create migration
supabase migration new add_auction_table

# Edit the migration file
# supabase/migrations/20250205_add_auction_table.sql

# Test locally
supabase db reset

# Push to staging
supabase db push --linked

# After testing, apply to production
supabase db push --linked --project-ref PROD_PROJECT_REF
```

### Migration Best Practices

1. **Never edit existing migrations** - create new ones
2. **Test migrations** on staging first
3. **Backup database** before production migrations
4. **Make migrations reversible** when possible

---

## Step 10: Monitoring & Maintenance

### Error Tracking (Sentry)

```bash
npm install @sentry/react
```

```typescript
// main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: import.meta.env.MODE,
});
```

### Analytics

```typescript
// Track key events
analytics.track('artwork_purchased', {
  artworkId: artwork.id,
  price: artwork.price,
});
```

### Health Checks

- Set up uptime monitoring (UptimeRobot, Pingdom)
- Monitor Supabase dashboard for errors
- Review logs weekly

---

## Complete Workflow Example

### Adding a New Feature

```bash
# 1. Create branch
git checkout main
git pull
git checkout -b feature/add-wishlist-share

# 2. Develop locally
npm run dev
# Make changes...

# 3. Test
npm run test
npm run build

# 4. Commit
git add .
git commit -m "feat(wishlist): add share functionality"

# 5. Push
git push origin feature/add-wishlist-share

# 6. Create PR on GitHub
# - Add description
# - Request review
# - Wait for CI to pass

# 7. After approval, merge to main
# - Vercel auto-deploys to production

# 8. Tag release if significant
git checkout main
git pull
npm version patch
git push --tags
```

---

## Team Collaboration

### Using Lovable with GitHub

You can use **both** Lovable and local development:

1. **Lovable for quick changes**: UI tweaks, content updates
2. **Local/GitHub for features**: Complex features, team collaboration

Changes sync both ways automatically.

### Branch Protection Rules

On GitHub, enable:
- Require PR reviews before merging
- Require status checks to pass
- Require branches to be up to date

---

## Summary Checklist

- [ ] GitHub repository connected
- [ ] Branching strategy defined
- [ ] CI/CD pipeline configured
- [ ] Environment variables managed
- [ ] Code review process in place
- [ ] Automated tests running
- [ ] Monitoring set up
- [ ] Release process documented
