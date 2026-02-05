# Monarch Gallery Architecture

## Overview

Monarch Gallery is a curated digital art marketplace built with React, Vite, and Supabase (via Lovable Cloud).

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS + shadcn/ui |
| State | TanStack Query (server state) |
| Routing | React Router v6 |
| Backend | Lovable Cloud (Supabase) |
| Auth | Supabase Auth + Wallet Connect |
| Database | PostgreSQL (via Supabase) |
| Storage | Supabase Storage |
| Animations | Framer Motion |

---

## Project Structure

```
monarch-gallery/
├── docs/                    # Documentation
├── public/                  # Static assets
├── src/
│   ├── assets/              # Images, fonts
│   ├── components/          # React components
│   │   ├── ui/              # shadcn/ui primitives
│   │   └── [Feature].tsx    # Feature components
│   ├── contexts/            # React contexts
│   │   └── CartContext.tsx  # Shopping cart state
│   ├── hooks/               # Custom hooks
│   │   ├── useAuth.tsx      # Authentication
│   │   ├── useTheme.tsx     # Dark/light mode
│   │   └── use-toast.ts     # Toast notifications
│   ├── integrations/
│   │   └── supabase/        # Auto-generated client
│   ├── lib/                 # Utilities
│   ├── pages/               # Route pages
│   ├── types/               # TypeScript definitions
│   ├── utils/               # Helper functions
│   ├── App.tsx              # Root component
│   ├── App.css              # App-specific styles
│   ├── index.css            # Design system tokens
│   └── main.tsx             # Entry point
├── supabase/
│   ├── config.toml          # Supabase config (auto-generated)
│   ├── functions/           # Edge functions
│   └── migrations/          # Database migrations
└── configuration files...
```

---

## Key Files

### Entry Points

| File | Purpose |
|------|---------|
| `main.tsx` | React DOM render, imports global CSS |
| `App.tsx` | Provider setup, routing |
| `index.css` | Design tokens, global styles |

### Core Hooks

| Hook | Purpose |
|------|---------|
| `useAuth` | Authentication state & methods |
| `useTheme` | Dark/light mode toggle |
| `useToast` | Toast notifications |
| `useMobile` | Responsive breakpoint detection |

### Contexts

| Context | Purpose |
|---------|---------|
| `AuthProvider` | User session, roles |
| `CartProvider` | Shopping cart state |
| `ThemeProvider` | Theme preference |

---

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                      React App                          │
├─────────────────────────────────────────────────────────┤
│  Pages → Components → Hooks                             │
│     ↓         ↓          ↓                              │
│  [useQuery/useMutation from TanStack Query]             │
│     ↓                                                   │
│  Supabase Client (@/integrations/supabase/client)       │
│     ↓                                                   │
│  Lovable Cloud (PostgreSQL + Auth + Storage)            │
└─────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (linked to auth.users) |
| `artists` | Artist profiles & metadata |
| `artworks` | Artwork listings |
| `collections` | Curated collections |
| `orders` | Purchase records |
| `wishlist` | User saved artworks |
| `offers` | Bid/offer system |
| `listings` | Secondary market listings |

### Relationships

```
profiles ←→ artists (1:1 optional)
artists ←→ artworks (1:many)
artworks ←→ collections (many:1)
profiles ←→ orders (1:many)
profiles ←→ wishlist (1:many)
```

### Row Level Security

All tables use RLS policies:
- Public read for published content
- Authenticated write for user-owned data
- Admin-only for content management

---

## Authentication

### Methods Supported

1. **Email/Password** - Standard signup/login
2. **Wallet Connect** - MetaMask / WalletConnect SIWE
3. **Magic Link** - Email OTP (for wallet users)

### Roles

| Role | Permissions |
|------|-------------|
| `admin` | Full CMS access, user management |
| `artist` | View artworks, manage own profile |
| `collector` | Purchase, wishlist, resell |

### Auth Flow

```
User Action → useAuth hook → Supabase Auth → Session Token
     ↓
onAuthStateChange listener → Update React state
     ↓
Protected routes check session
```

---

## Routing

All routes defined in `App.tsx`:

### Public Routes
- `/` - Home
- `/explore` - Artwork grid
- `/artists` - Artist listings
- `/collections` - Curated collections
- `/about` - About page
- `/journal` - Blog/journal
- `/auth` - Login/signup

### Protected Routes
- `/profile` - User profile
- `/wishlist` - Saved artworks
- `/cart` - Shopping cart
- `/checkout` - Purchase flow
- `/my-listings` - Resale listings

### Admin Routes
- `/admin` - Dashboard
- `/admin/artworks` - Artwork management
- `/admin/analytics` - Stats

---

## API Pattern

Using TanStack Query for server state:

```tsx
// Fetching data
const { data, isLoading } = useQuery({
  queryKey: ['artworks'],
  queryFn: async () => {
    const { data } = await supabase
      .from('artworks')
      .select('*, artists(*)')
      .eq('status', 'published');
    return data;
  }
});

// Mutations
const mutation = useMutation({
  mutationFn: async (newArtwork) => {
    const { data } = await supabase
      .from('artworks')
      .insert(newArtwork);
    return data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries(['artworks']);
  }
});
```

---

## Component Patterns

### Page Components

```tsx
// src/pages/PageName.tsx
const PageName = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-16">
        {/* Content */}
      </main>
      <Footer />
    </div>
  );
};
```

### Feature Components

```tsx
// src/components/FeatureName.tsx
interface FeatureNameProps {
  data: DataType;
  onAction: () => void;
}

const FeatureName = ({ data, onAction }: FeatureNameProps) => {
  return (/* JSX */);
};
```

---

## Environment Variables

Managed automatically by Lovable Cloud:

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | API endpoint |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anon key |
| `VITE_SUPABASE_PROJECT_ID` | Project ID |

**Never edit `.env` directly** - it's auto-generated.

---

## Deployment

### Frontend
- Automatic via Lovable
- Click "Publish" to deploy

### Backend
- Edge functions deploy automatically
- Database migrations via migration tool

### Custom Domain
- Settings → Domains → Connect Domain
