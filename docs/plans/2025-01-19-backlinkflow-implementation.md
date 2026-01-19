# BacklinkFlow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a directory-based SaaS for discovering and tracking backlink platforms.

**Architecture:** Next.js 15 App Router with Directus as headless CMS. Custom OAuth handling in API routes, Zustand for client state, drag-and-drop Kanban board.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS v4, Directus SDK, Zustand, @dnd-kit, next-themes

---

## Phase 1: Project Setup

### Task 1.1: Initialize Next.js Project

**Files:**
- Create: Project root with Next.js scaffolding

**Step 1: Create Next.js app**

```bash
cd /Users/lixuan/code/backflow.app
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack
```

Select: Yes to all defaults

**Step 2: Verify project runs**

```bash
npm run dev
```

Expected: App running at localhost:3000

**Step 3: Commit**

```bash
git add -A && git commit -m "chore: initialize Next.js 15 project"
```

---

### Task 1.2: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install core dependencies**

```bash
npm install @directus/sdk zustand @tanstack/react-query @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities next-themes sonner lucide-react jose zod react-hook-form @hookform/resolvers
```

**Step 2: Verify installation**

```bash
npm run build
```

Expected: Build succeeds

**Step 3: Commit**

```bash
git add -A && git commit -m "chore: add project dependencies"
```

---

### Task 1.3: Setup Environment Variables

**Files:**
- Create: `.env.local`
- Create: `.env.example`

**Step 1: Create .env.local**

```env
# Directus
DIRECTUS_URL=https://directus-backflow.aimazing.site
DIRECTUS_TOKEN=RguUCCYA6fYah3rc_2wNQVMd8Zr7G1AA

# OAuth (to be filled)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Session
JWT_SECRET=backflow-jwt-secret-change-in-production

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Step 2: Create .env.example (without secrets)**

```env
DIRECTUS_URL=
DIRECTUS_TOKEN=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
JWT_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Step 3: Add .env.local to .gitignore (should already be there)**

**Step 4: Commit**

```bash
git add .env.example && git commit -m "chore: add environment variables template"
```

---

### Task 1.4: Setup Directus Client

**Files:**
- Create: `src/lib/directus.ts`

**Step 1: Create Directus client**

```typescript
import { createDirectus, rest, staticToken } from '@directus/sdk';

export interface Platform {
  id: string;
  name: string;
  slug: string;
  website_url: string;
  description: string;
  logo: string | null;
  domain_authority: number;
  cost_type: 'free' | 'paid' | 'freemium';
  status: 'published' | 'pending_review' | 'rejected';
  categories: CategoryRelation[];
  date_created: string;
  user_created: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface CategoryRelation {
  id: string;
  platforms_id: string;
  categories_id: string | Category;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  auth_provider: 'email' | 'google' | 'github';
  provider_id: string | null;
  password_hash: string | null;
  date_created: string;
  last_login: string | null;
}

export interface UserBoard {
  id: string;
  user: string | User;
  platform: string | Platform;
  status: 'todo' | 'in_progress' | 'submitted' | 'live';
  backlink_url: string | null;
  notes: string | null;
  date_created: string;
  date_updated: string;
}

export interface Schema {
  platforms: Platform[];
  categories: Category[];
  platforms_categories: CategoryRelation[];
  users: User[];
  user_boards: UserBoard[];
}

const directusUrl = process.env.DIRECTUS_URL!;
const directusToken = process.env.DIRECTUS_TOKEN!;

export const directus = createDirectus<Schema>(directusUrl)
  .with(staticToken(directusToken))
  .with(rest());

export const getDirectusFileUrl = (fileId: string | null) => {
  if (!fileId) return null;
  return `${directusUrl}/assets/${fileId}`;
};
```

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: setup Directus client with schema types"
```

---

## Phase 2: Create Directus Collections

### Task 2.1: Create Categories Collection

**Step 1: Create collection via API**

```bash
curl -X POST "https://directus-backflow.aimazing.site/collections" \
  -H "Authorization: Bearer RguUCCYA6fYah3rc_2wNQVMd8Zr7G1AA" \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "categories",
    "meta": { "icon": "category" },
    "schema": {},
    "fields": [
      { "field": "id", "type": "uuid", "meta": { "special": ["uuid"], "interface": "input", "readonly": true, "hidden": true }, "schema": { "is_primary_key": true, "has_auto_increment": false } },
      { "field": "name", "type": "string", "meta": { "interface": "input", "required": true }, "schema": { "is_nullable": false } },
      { "field": "slug", "type": "string", "meta": { "interface": "input", "required": true }, "schema": { "is_nullable": false, "is_unique": true } }
    ]
  }'
```

**Step 2: Verify collection created**

```bash
curl -s "https://directus-backflow.aimazing.site/items/categories" \
  -H "Authorization: Bearer RguUCCYA6fYah3rc_2wNQVMd8Zr7G1AA"
```

Expected: `{"data":[]}`

---

### Task 2.2: Create Platforms Collection

**Step 1: Create collection via API**

```bash
curl -X POST "https://directus-backflow.aimazing.site/collections" \
  -H "Authorization: Bearer RguUCCYA6fYah3rc_2wNQVMd8Zr7G1AA" \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "platforms",
    "meta": { "icon": "link" },
    "schema": {},
    "fields": [
      { "field": "id", "type": "uuid", "meta": { "special": ["uuid"], "interface": "input", "readonly": true, "hidden": true }, "schema": { "is_primary_key": true } },
      { "field": "name", "type": "string", "meta": { "interface": "input", "required": true }, "schema": { "is_nullable": false } },
      { "field": "slug", "type": "string", "meta": { "interface": "input", "required": true }, "schema": { "is_nullable": false, "is_unique": true } },
      { "field": "website_url", "type": "string", "meta": { "interface": "input", "required": true }, "schema": { "is_nullable": false } },
      { "field": "description", "type": "text", "meta": { "interface": "input-multiline" }, "schema": { "is_nullable": true } },
      { "field": "logo", "type": "uuid", "meta": { "interface": "file-image", "special": ["file"] }, "schema": { "is_nullable": true } },
      { "field": "domain_authority", "type": "integer", "meta": { "interface": "input", "options": { "min": 0, "max": 100 } }, "schema": { "is_nullable": true, "default_value": 0 } },
      { "field": "cost_type", "type": "string", "meta": { "interface": "select-dropdown", "options": { "choices": [{"text":"Free","value":"free"},{"text":"Paid","value":"paid"},{"text":"Freemium","value":"freemium"}] } }, "schema": { "is_nullable": false, "default_value": "free" } },
      { "field": "status", "type": "string", "meta": { "interface": "select-dropdown", "options": { "choices": [{"text":"Published","value":"published"},{"text":"Pending Review","value":"pending_review"},{"text":"Rejected","value":"rejected"}] } }, "schema": { "is_nullable": false, "default_value": "pending_review" } },
      { "field": "date_created", "type": "timestamp", "meta": { "special": ["date-created"], "interface": "datetime", "readonly": true }, "schema": {} },
      { "field": "user_created", "type": "uuid", "meta": { "special": ["user-created"], "interface": "select-dropdown-m2o", "readonly": true }, "schema": { "is_nullable": true } }
    ]
  }'
```

---

### Task 2.3: Create Users Collection

**Step 1: Create collection via API**

```bash
curl -X POST "https://directus-backflow.aimazing.site/collections" \
  -H "Authorization: Bearer RguUCCYA6fYah3rc_2wNQVMd8Zr7G1AA" \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "users",
    "meta": { "icon": "people" },
    "schema": {},
    "fields": [
      { "field": "id", "type": "uuid", "meta": { "special": ["uuid"], "interface": "input", "readonly": true, "hidden": true }, "schema": { "is_primary_key": true } },
      { "field": "email", "type": "string", "meta": { "interface": "input", "required": true }, "schema": { "is_nullable": false, "is_unique": true } },
      { "field": "name", "type": "string", "meta": { "interface": "input" }, "schema": { "is_nullable": true } },
      { "field": "avatar_url", "type": "string", "meta": { "interface": "input" }, "schema": { "is_nullable": true } },
      { "field": "auth_provider", "type": "string", "meta": { "interface": "select-dropdown", "options": { "choices": [{"text":"Email","value":"email"},{"text":"Google","value":"google"},{"text":"GitHub","value":"github"}] } }, "schema": { "is_nullable": false, "default_value": "email" } },
      { "field": "provider_id", "type": "string", "meta": { "interface": "input" }, "schema": { "is_nullable": true } },
      { "field": "password_hash", "type": "string", "meta": { "interface": "input", "hidden": true }, "schema": { "is_nullable": true } },
      { "field": "date_created", "type": "timestamp", "meta": { "special": ["date-created"], "interface": "datetime", "readonly": true }, "schema": {} },
      { "field": "last_login", "type": "timestamp", "meta": { "interface": "datetime" }, "schema": { "is_nullable": true } }
    ]
  }'
```

---

### Task 2.4: Create User Boards Collection

**Step 1: Create collection via API**

```bash
curl -X POST "https://directus-backflow.aimazing.site/collections" \
  -H "Authorization: Bearer RguUCCYA6fYah3rc_2wNQVMd8Zr7G1AA" \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "user_boards",
    "meta": { "icon": "dashboard" },
    "schema": {},
    "fields": [
      { "field": "id", "type": "uuid", "meta": { "special": ["uuid"], "interface": "input", "readonly": true, "hidden": true }, "schema": { "is_primary_key": true } },
      { "field": "user", "type": "uuid", "meta": { "interface": "select-dropdown-m2o", "special": ["m2o"], "required": true }, "schema": { "is_nullable": false, "foreign_key_table": "users", "foreign_key_column": "id" } },
      { "field": "platform", "type": "uuid", "meta": { "interface": "select-dropdown-m2o", "special": ["m2o"], "required": true }, "schema": { "is_nullable": false, "foreign_key_table": "platforms", "foreign_key_column": "id" } },
      { "field": "status", "type": "string", "meta": { "interface": "select-dropdown", "options": { "choices": [{"text":"To Do","value":"todo"},{"text":"In Progress","value":"in_progress"},{"text":"Submitted","value":"submitted"},{"text":"Live","value":"live"}] } }, "schema": { "is_nullable": false, "default_value": "todo" } },
      { "field": "backlink_url", "type": "string", "meta": { "interface": "input" }, "schema": { "is_nullable": true } },
      { "field": "notes", "type": "text", "meta": { "interface": "input-multiline" }, "schema": { "is_nullable": true } },
      { "field": "date_created", "type": "timestamp", "meta": { "special": ["date-created"], "interface": "datetime", "readonly": true }, "schema": {} },
      { "field": "date_updated", "type": "timestamp", "meta": { "special": ["date-updated"], "interface": "datetime", "readonly": true }, "schema": {} }
    ]
  }'
```

---

### Task 2.5: Create M2M Relation (Platforms ↔ Categories)

**Step 1: Create junction collection**

```bash
curl -X POST "https://directus-backflow.aimazing.site/collections" \
  -H "Authorization: Bearer RguUCCYA6fYah3rc_2wNQVMd8Zr7G1AA" \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "platforms_categories",
    "meta": { "hidden": true },
    "schema": {},
    "fields": [
      { "field": "id", "type": "integer", "meta": { "hidden": true }, "schema": { "is_primary_key": true, "has_auto_increment": true } },
      { "field": "platforms_id", "type": "uuid", "schema": { "foreign_key_table": "platforms", "foreign_key_column": "id" } },
      { "field": "categories_id", "type": "uuid", "schema": { "foreign_key_table": "categories", "foreign_key_column": "id" } }
    ]
  }'
```

**Step 2: Add M2M field to platforms**

```bash
curl -X POST "https://directus-backflow.aimazing.site/fields/platforms" \
  -H "Authorization: Bearer RguUCCYA6fYah3rc_2wNQVMd8Zr7G1AA" \
  -H "Content-Type: application/json" \
  -d '{
    "field": "categories",
    "type": "alias",
    "meta": {
      "interface": "list-m2m",
      "special": ["m2m"],
      "options": { "template": "{{categories_id.name}}" }
    }
  }'
```

**Step 3: Create relation**

```bash
curl -X POST "https://directus-backflow.aimazing.site/relations" \
  -H "Authorization: Bearer RguUCCYA6fYah3rc_2wNQVMd8Zr7G1AA" \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "platforms_categories",
    "field": "platforms_id",
    "related_collection": "platforms",
    "meta": { "one_field": "categories", "sort_field": null, "one_deselect_action": "nullify" },
    "schema": { "on_delete": "SET NULL" }
  }'
```

```bash
curl -X POST "https://directus-backflow.aimazing.site/relations" \
  -H "Authorization: Bearer RguUCCYA6fYah3rc_2wNQVMd8Zr7G1AA" \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "platforms_categories",
    "field": "categories_id",
    "related_collection": "categories",
    "meta": { "one_field": null, "sort_field": null, "one_deselect_action": "nullify" },
    "schema": { "on_delete": "SET NULL" }
  }'
```

---

### Task 2.6: Seed Sample Data

**Step 1: Add categories**

```bash
curl -X POST "https://directus-backflow.aimazing.site/items/categories" \
  -H "Authorization: Bearer RguUCCYA6fYah3rc_2wNQVMd8Zr7G1AA" \
  -H "Content-Type: application/json" \
  -d '[
    { "name": "SaaS", "slug": "saas" },
    { "name": "AI", "slug": "ai" },
    { "name": "Startup", "slug": "startup" },
    { "name": "Developer Tools", "slug": "developer-tools" },
    { "name": "Marketing", "slug": "marketing" }
  ]'
```

**Step 2: Add sample platforms**

```bash
curl -X POST "https://directus-backflow.aimazing.site/items/platforms" \
  -H "Authorization: Bearer RguUCCYA6fYah3rc_2wNQVMd8Zr7G1AA" \
  -H "Content-Type: application/json" \
  -d '[
    { "name": "Product Hunt", "slug": "product-hunt", "website_url": "https://producthunt.com", "description": "The best place to launch your product", "domain_authority": 91, "cost_type": "free", "status": "published" },
    { "name": "Hacker News", "slug": "hacker-news", "website_url": "https://news.ycombinator.com", "description": "Tech news and startup discussion", "domain_authority": 92, "cost_type": "free", "status": "published" },
    { "name": "Indie Hackers", "slug": "indie-hackers", "website_url": "https://indiehackers.com", "description": "Community for indie makers", "domain_authority": 65, "cost_type": "free", "status": "published" },
    { "name": "BetaList", "slug": "betalist", "website_url": "https://betalist.com", "description": "Discover tomorrow startups today", "domain_authority": 58, "cost_type": "freemium", "status": "published" },
    { "name": "AlternativeTo", "slug": "alternativeto", "website_url": "https://alternativeto.net", "description": "Crowdsourced software recommendations", "domain_authority": 75, "cost_type": "free", "status": "published" }
  ]'
```

---

## Phase 3: UI Components

### Task 3.1: Setup Theme Provider

**Files:**
- Create: `src/components/providers.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Create providers wrapper**

```typescript
// src/components/providers.tsx
'use client';

import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
```

**Step 2: Update layout.tsx**

```typescript
// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BacklinkFlow - Discover & Track Backlink Platforms',
  description: 'Stop guessing where to post. Find the best platforms for building backlinks.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

**Step 3: Update globals.css for dark mode**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --border: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: setup theme provider and global styles"
```

---

### Task 3.2: Create UI Primitives

**Files:**
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/input.tsx`
- Create: `src/components/ui/card.tsx`
- Create: `src/components/ui/badge.tsx`

**Step 1: Create Button component**

```typescript
// src/components/ui/button.tsx
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
            'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
            'border border-border bg-background hover:bg-accent hover:text-accent-foreground': variant === 'outline',
            'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
          },
          {
            'h-10 px-4 py-2': size === 'default',
            'h-9 rounded-md px-3': size === 'sm',
            'h-11 rounded-md px-8': size === 'lg',
            'h-10 w-10': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
```

**Step 2: Create utils**

```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Step 3: Install clsx and tailwind-merge**

```bash
npm install clsx tailwind-merge
```

**Step 4: Create Input component**

```typescript
// src/components/ui/input.tsx
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
```

**Step 5: Create Card component**

```typescript
// src/components/ui/card.tsx
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-lg border border-border bg-card text-card-foreground shadow-sm', className)}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-2xl font-semibold leading-none tracking-tight', className)} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
```

**Step 6: Create Badge component**

```typescript
// src/components/ui/badge.tsx
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        {
          'bg-primary text-primary-foreground': variant === 'default',
          'bg-secondary text-secondary-foreground': variant === 'secondary',
          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100': variant === 'success',
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100': variant === 'warning',
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
```

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: add UI primitive components"
```

---

## Phase 4: Layout Components

### Task 4.1: Create Navbar

**Files:**
- Create: `src/components/navbar.tsx`
- Create: `src/components/theme-toggle.tsx`

**Step 1: Create ThemeToggle**

```typescript
// src/components/theme-toggle.tsx
'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Button variant="ghost" size="icon" disabled />;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
```

**Step 2: Create Navbar**

```typescript
// src/components/navbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layers, LayoutDashboard, LogIn, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

export function Navbar() {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();

  const navLinks = [
    { href: '/', label: 'Directory', icon: Layers },
    { href: '/board', label: 'My Board', icon: LayoutDashboard, protected: true },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Layers className="h-6 w-6" />
          <span className="font-bold">BacklinkFlow</span>
        </Link>

        <nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
          {navLinks.map((link) => {
            if (link.protected && !user) return null;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center space-x-1 transition-colors hover:text-foreground/80',
                  pathname === link.href ? 'text-foreground' : 'text-foreground/60'
                )}
              >
                <link.icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center space-x-2">
          <ThemeToggle />
          {isLoading ? (
            <Button variant="ghost" size="sm" disabled>
              Loading...
            </Button>
          ) : user ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 text-sm">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name || ''} className="h-8 w-8 rounded-full" />
                ) : (
                  <User className="h-5 w-5" />
                )}
                <span className="hidden md:inline">{user.name || user.email}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="default" size="sm">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
```

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add navbar and theme toggle"
```

---

### Task 4.2: Create Footer

**Files:**
- Create: `src/components/footer.tsx`

**Step 1: Create Footer**

```typescript
// src/components/footer.tsx
import Link from 'next/link';
import { Layers } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Layers className="h-6 w-6" />
          <p className="text-center text-sm leading-loose md:text-left">
            Built for indie hackers. Stop guessing where to post.
          </p>
        </div>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <Link href="/submit" className="hover:text-foreground">
            Submit a Platform
          </Link>
          <span>|</span>
          <span>&copy; {new Date().getFullYear()} BacklinkFlow</span>
        </div>
      </div>
    </footer>
  );
}
```

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: add footer component"
```

---

## Phase 5: Auth System

### Task 5.1: Create Auth Store and Hook

**Files:**
- Create: `src/stores/auth-store.ts`
- Create: `src/hooks/use-auth.ts`
- Create: `src/lib/auth.ts`

**Step 1: Create auth library**

```typescript
// src/lib/auth.ts
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { User } from './directus';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret');

export async function createSession(user: User) {
  const token = await new SignJWT({ userId: user.id, email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  return token;
}

export async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string; email: string };
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;
  return verifySession(token);
}
```

**Step 2: Create auth store**

```typescript
// src/stores/auth-store.ts
import { create } from 'zustand';
import { User } from '@/lib/directus';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
}));
```

**Step 3: Create auth hook**

```typescript
// src/hooks/use-auth.ts
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

export function useAuth() {
  const { user, isLoading, setUser, setLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [setUser, setLoading]);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      toast.success('Logged out successfully');
      router.push('/');
    } catch {
      toast.error('Failed to logout');
    }
  };

  return { user, isLoading, logout };
}
```

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add auth store and hook"
```

---

### Task 5.2: Create Auth API Routes

**Files:**
- Create: `src/app/api/auth/me/route.ts`
- Create: `src/app/api/auth/logout/route.ts`
- Create: `src/app/api/auth/login/route.ts`
- Create: `src/app/api/auth/register/route.ts`

**Step 1: Create /api/auth/me**

```typescript
// src/app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import { directus } from '@/lib/directus';
import { readItem } from '@directus/sdk';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const session = await verifySession(token);
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const user = await directus.request(readItem('users', session.userId));
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
```

**Step 2: Create /api/auth/logout**

```typescript
// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  return NextResponse.json({ success: true });
}
```

**Step 3: Create /api/auth/login**

```typescript
// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { directus } from '@/lib/directus';
import { readItems } from '@directus/sdk';
import { createSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const users = await directus.request(
      readItems('users', {
        filter: { email: { _eq: email } },
        limit: 1,
      })
    );

    const user = users[0];
    if (!user || !user.password_hash) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await createSession(user);
    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ user: { ...user, password_hash: undefined } });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
```

**Step 4: Create /api/auth/register**

```typescript
// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { directus } from '@/lib/directus';
import { createItem, readItems } from '@directus/sdk';
import { createSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Check if user exists
    const existing = await directus.request(
      readItems('users', {
        filter: { email: { _eq: email } },
        limit: 1,
      })
    );

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const user = await directus.request(
      createItem('users', {
        email,
        name: name || email.split('@')[0],
        password_hash,
        auth_provider: 'email',
      })
    );

    const token = await createSession(user);
    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ user: { ...user, password_hash: undefined } });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
```

**Step 5: Install bcryptjs**

```bash
npm install bcryptjs && npm install -D @types/bcryptjs
```

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: add auth API routes"
```

---

## Phase 6-10: Remaining Implementation

See continued plan for:
- Phase 6: Login/Register Pages
- Phase 7: Directory Page & Platform Cards
- Phase 8: Board Store & User Board Page
- Phase 9: Kanban Drag & Drop
- Phase 10: Submit Platform Form & Final Polish

---

## Execution

After saving this plan, choose execution approach:

1. **Subagent-Driven (this session)** - Dispatch fresh subagent per task
2. **Parallel Session (separate)** - New session with executing-plans skill
