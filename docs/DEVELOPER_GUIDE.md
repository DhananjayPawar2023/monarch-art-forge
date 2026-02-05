# Monarch Gallery Developer Guide

## Getting Started

### Prerequisites

- Node.js 18+
- npm or bun

### Local Development

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd monarch-gallery

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

---

## Development Workflow

### Making Changes

1. **UI Changes** - Edit components in `src/components/` or `src/pages/`
2. **Styling** - Use Tailwind classes with design tokens from `index.css`
3. **Database** - Use migration tool for schema changes
4. **API Logic** - Create edge functions in `supabase/functions/`

### File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `ArtworkCard.tsx` |
| Hooks | camelCase with `use` prefix | `useAuth.tsx` |
| Pages | PascalCase | `ArtworkDetail.tsx` |
| Utilities | camelCase | `cryptoPayment.ts` |

---

## Code Standards

### TypeScript

Always use strict typing:

```tsx
// ✅ Good - Explicit types
interface ArtworkProps {
  id: string;
  title: string;
  price: number;
  artist: Artist;
}

const ArtworkCard = ({ id, title, price, artist }: ArtworkProps) => {
  // ...
};

// ❌ Bad - Any types
const ArtworkCard = (props: any) => {
  // ...
};
```

### Imports

Use path aliases:

```tsx
// ✅ Good - Path alias
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

// ❌ Bad - Relative paths
import { Button } from "../../../components/ui/button";
```

### Component Structure

```tsx
// 1. Imports
import { useState } from "react";
import { Button } from "@/components/ui/button";

// 2. Types
interface ComponentProps {
  title: string;
}

// 3. Component
const Component = ({ title }: ComponentProps) => {
  // 3a. Hooks
  const [state, setState] = useState(false);
  
  // 3b. Handlers
  const handleClick = () => {
    setState(true);
  };
  
  // 3c. Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick}>Click</Button>
    </div>
  );
};

// 4. Export
export default Component;
```

---

## Styling Guidelines

### Using Design Tokens

```tsx
// ✅ Always use semantic tokens
<div className="bg-background text-foreground border-border" />

// ❌ Never use raw colors
<div className="bg-white text-gray-900" />
```

### Responsive Design

Use Tailwind's responsive prefixes:

```tsx
<div className="
  px-4 md:px-8 lg:px-16
  text-sm md:text-base lg:text-lg
  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
" />
```

### Dark Mode

Dark mode is automatic via the `dark` class. Both modes are defined in `index.css`.

```tsx
// Styles that differ between modes
<div className="bg-card dark:bg-card" /> // Uses CSS variables
```

---

## State Management

### Server State (TanStack Query)

For data from the backend:

```tsx
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Fetching
const { data, isLoading, error } = useQuery({
  queryKey: ['artworks', artistId],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .eq('artist_id', artistId);
    if (error) throw error;
    return data;
  }
});

// Mutations
const createArtwork = useMutation({
  mutationFn: async (artwork: NewArtwork) => {
    const { data, error } = await supabase
      .from('artworks')
      .insert(artwork)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
});
```

### Client State (React Context)

For app-wide UI state:

```tsx
// Using the cart context
import { useCart } from "@/contexts/CartContext";

const Component = () => {
  const { items, addItem, removeItem } = useCart();
  // ...
};
```

---

## Database Operations

### Reading Data

```tsx
// Simple query
const { data } = await supabase
  .from('artworks')
  .select('*')
  .eq('status', 'published');

// With joins
const { data } = await supabase
  .from('artworks')
  .select(`
    *,
    artists (name, slug),
    collections (title)
  `)
  .order('created_at', { ascending: false });

// Pagination
const { data } = await supabase
  .from('artworks')
  .select('*')
  .range(0, 9); // First 10 items
```

### Writing Data

```tsx
// Insert
const { data, error } = await supabase
  .from('wishlist')
  .insert({ user_id: userId, artwork_id: artworkId });

// Update
const { error } = await supabase
  .from('profiles')
  .update({ full_name: 'New Name' })
  .eq('id', userId);

// Delete
const { error } = await supabase
  .from('wishlist')
  .delete()
  .eq('id', wishlistId);
```

### RLS Considerations

- Always test queries with actual user sessions
- Public tables don't require auth
- User-owned data requires `auth.uid()` in policies

---

## Authentication

### Using Auth Hook

```tsx
import { useAuth } from "@/hooks/useAuth";

const Component = () => {
  const { 
    user,           // Current user object
    session,        // Session data
    userRole,       // 'admin' | 'artist' | 'collector'
    isAdmin,        // Boolean shortcut
    loading,        // Auth loading state
    signIn,         // Email/password login
    signUp,         // Registration
    signOut,        // Logout
    signInWithWallet, // Wallet auth
  } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Redirect to="/auth" />;
  
  return <div>Welcome, {user.email}</div>;
};
```

### Protected Routes

```tsx
// In App.tsx
<Route 
  path="/profile" 
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  } 
/>
```

---

## Forms

### Using React Hook Form

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  price: z.number().positive("Price must be positive"),
});

const ArtworkForm = () => {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { title: "", price: 0 }
  });

  const onSubmit = async (data) => {
    // Handle submission
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save</Button>
      </form>
    </Form>
  );
};
```

---

## Error Handling

### Toast Notifications

```tsx
import { useToast } from "@/hooks/use-toast";

const Component = () => {
  const { toast } = useToast();

  const handleAction = async () => {
    try {
      await someAsyncAction();
      toast({
        title: "Success",
        description: "Action completed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };
};
```

### Query Error States

```tsx
const { data, isLoading, error } = useQuery({...});

if (error) {
  return (
    <div className="text-destructive">
      Failed to load: {error.message}
    </div>
  );
}
```

---

## Testing

### Running Tests

```bash
npm test
```

### Writing Tests

```tsx
// src/components/Button.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./button";

describe("Button", () => {
  it("renders correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });
});
```

---

## Common Patterns

### Loading States

```tsx
// Button with loading
<Button disabled={isLoading}>
  {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
  Submit
</Button>

// Page loading
if (isLoading) {
  return (
    <div className="flex justify-center py-20">
      <LoadingSpinner size="lg" />
    </div>
  );
}
```

### Empty States

```tsx
if (data?.length === 0) {
  return (
    <div className="text-center py-20 text-muted-foreground">
      <p>No artworks found</p>
      <Button variant="outline" className="mt-4">
        Browse Collections
      </Button>
    </div>
  );
}
```

### Optimistic Updates

```tsx
const mutation = useMutation({
  mutationFn: addToWishlist,
  onMutate: async (artworkId) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['wishlist']);
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(['wishlist']);
    
    // Optimistically update
    queryClient.setQueryData(['wishlist'], (old) => [...old, artworkId]);
    
    return { previous };
  },
  onError: (err, artworkId, context) => {
    // Rollback on error
    queryClient.setQueryData(['wishlist'], context.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries(['wishlist']);
  },
});
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "Invalid hook call" | Check for duplicate React versions |
| Supabase auth not working | Verify RLS policies allow access |
| Styles not applying | Check Tailwind class order, purge config |
| Types out of sync | Regenerate types (automatic in Lovable) |

### Debug Tips

1. Check browser console for errors
2. Use React DevTools to inspect state
3. Check Network tab for API calls
4. Verify Supabase RLS in the backend panel
