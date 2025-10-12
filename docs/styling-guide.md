# Styling Guide

This guide explains when and how to use different styling approaches in the UI Designer project.

## Overview

The project uses a layered styling approach:

| Tool         | Purpose               | Use When                                      |
| ------------ | --------------------- | --------------------------------------------- |
| Tailwind CSS | Utility-first styling | Server Components, static styles, layout      |
| Emotion      | CSS-in-JS             | Client Components with dynamic/runtime styles |
| CSS Modules  | Component-scoped CSS  | When you need traditional CSS with scoping    |

> UI Primitives: shadcn/ui

- This repo supports generating shadcn UI components.
- Generate components with:

```bash
bunx shadcn@latest add <component>
```

- Place generated components under the app's `ui/` directory (see architecture overview). Style them with Tailwind; use Emotion only for dynamic, client-only behavior.

## Decision Tree

```text
Is this a Server Component?
├─ Yes → Use Tailwind CSS (or CSS Modules if complex)
└─ No (Client Component) → Continue...

Does the styling need to be dynamic at runtime?
├─ Yes (theme switching, props-based styles) → Use Emotion
└─ No (static styles) → Use Tailwind CSS
```

## 1. Tailwind CSS (Primary)

**Use for:** Server Components, static styles, layout, responsive design.

### Why Tailwind First?

- ✅ Zero runtime cost
- ✅ Works perfectly with Server Components
- ✅ Excellent for responsive design
- ✅ Streams well with SSR
- ✅ Smaller bundle sizes
- ✅ Great DX with IntelliSense

### Setup

Tailwind v4 is already configured. The main CSS file is in `styles/globals.css`:

```css
/* styles/globals.css */
@import 'tailwindcss';

/* Custom utilities */
@utility scrollbar-hidden {
  &::-webkit-scrollbar {
    display: none;
  }
}

/* Theme variables */
@theme inline {
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
}
```

### Basic Usage

```typescript
// Server Component (default)
export default function ProjectCard({ title, description }) {
  return (
    <div className="rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
    </div>
  );
}
```

### Responsive Design

```typescript
export default function Hero() {
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold">
        Welcome
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* cards */}
      </div>
    </div>
  );
}
```

### Custom Utilities (Tailwind v4)

Define custom utilities in `globals.css`:

```css
@utility text-balance {
  text-wrap: balance;
}

@utility scrollbar-hidden {
  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
}
```

Usage:

```typescript
<p className="text-balance">This text will be balanced across lines</p>
<div className="scrollbar-hidden overflow-auto">Scrollable without scrollbar</div>
```

### Theme Variables

Define CSS variables in the `@theme` block:

```css
@theme inline {
  --color-brand: #3b82f6;
  --color-brand-dark: #2563eb;
  --font-heading: 'Inter', sans-serif;
}
```

Use with Tailwind utilities:

```typescript
<h1 className="text-[var(--color-brand)] font-[var(--font-heading)]">
  Heading
</h1>
```

### Tailwind Best Practices

1. **Use semantic grouping**

```typescript
// ❌ Bad: Random order
<div className="p-4 text-blue-500 mt-2 flex rounded-lg">

// ✅ Good: Layout → Spacing → Typography → Colors → Effects
<div className="flex rounded-lg mt-2 p-4 text-blue-500">
```

2. **Extract repeated patterns**

```typescript
// ❌ Bad: Repeated classes
<button className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
<button className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">

// ✅ Good: Create a component
function Button({ children }) {
  return (
    <button className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
      {children}
    </button>
  );
}
```

3. **Use @apply sparingly**

Only use `@apply` for truly reusable patterns:

```css
@utility btn-primary {
  @apply rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none;
}
```

## 2. Emotion (For Dynamic Styles)

**Use for:** Client Components that need runtime styling, theme switching, or props-based styles.

### Why Emotion?

- ✅ Dynamic styles based on props
- ✅ Theme switching at runtime
- ✅ CSS-in-JS with TypeScript support
- ✅ Scoped styles automatically
- ⚠️ Runtime cost (only use in Client Components)

### Setup

Emotion is configured in `apps/web/app/emotion-registry.tsx`. It's automatically available in Client Components.

### Basic Usage with `styled`

```typescript
'use client';

import styled from '@emotion/styled';

const Card = styled.div<{ variant?: 'default' | 'highlighted' }>`
  padding: 1.5rem;
  border-radius: 0.5rem;
  background: ${(props) => props.variant === 'highlighted' ? '#f0f9ff' : '#ffffff'};
  border: 1px solid ${(props) => props.variant === 'highlighted' ? '#3b82f6' : '#e5e7eb'};
  transition: all 200ms ease;

  &:hover {
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  }
`;

export function ProjectCard({ title, highlighted }) {
  return (
    <Card variant={highlighted ? 'highlighted' : 'default'}>
      <h3>{title}</h3>
    </Card>
  );
}
```

### Using the `css` Prop

```typescript
'use client';

import { css } from '@emotion/react';

export function DynamicButton({ size = 'medium' }) {
  return (
    <button
      css={css`
        padding: ${size === 'large' ? '1rem 2rem' : '0.5rem 1rem'};
        font-size: ${size === 'large' ? '1.125rem' : '1rem'};
        border-radius: 0.5rem;
        background: #3b82f6;
        color: white;
        border: none;
        cursor: pointer;

        &:hover {
          background: #2563eb;
        }
      `}
    >
      Click me
    </button>
  );
}
```

### Theme Support

```typescript
'use client';

import { ThemeProvider } from '@emotion/react';
import styled from '@emotion/styled';

const theme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    text: '#1f2937',
  },
  spacing: {
    small: '0.5rem',
    medium: '1rem',
    large: '1.5rem',
  },
};

const Button = styled.button`
  background: ${(props) => props.theme.colors.primary};
  padding: ${(props) => props.theme.spacing.medium};
  color: white;
  border: none;
  border-radius: 0.5rem;
`;

export function ThemedComponent({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <Button>{children}</Button>
    </ThemeProvider>
  );
}
```

### Combining Tailwind + Emotion

You can use both together:

```typescript
'use client';

import styled from '@emotion/styled';

// Emotion for dynamic parts, Tailwind for static parts
const Card = styled.div<{ isActive: boolean }>`
  background: ${(props) => props.isActive ? '#dbeafe' : 'transparent'};
  border-color: ${(props) => props.isActive ? '#3b82f6' : '#e5e7eb'};
`;

export function HybridCard({ isActive, children }) {
  return (
    <Card
      isActive={isActive}
      className="rounded-lg border p-4 transition-all"
    >
      {children}
    </Card>
  );
}
```

### Emotion Best Practices

1. **Scope Emotion to Client Islands**

```typescript
// ❌ Bad: Wrapping entire app
export default function RootLayout({ children }) {
  return (
    <EmotionProviders>
      {children} {/* Everything is client-side now */}
    </EmotionProviders>
  );
}

// ✅ Good: Only wrap client sections
export default function RootLayout({ children }) {
  return (
    <>
      <ServerHeader />
      <EmotionProviders>
        <ClientDashboard />
      </EmotionProviders>
      <ServerFooter />
    </>
  );
}
```

2. **Use CSS Variables for Theme Tokens**

```typescript
// ✅ Good: Define variables at server boundary
// globals.css
@theme inline {
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
}

// Client component can read them
const Button = styled.button`
  background: var(--color-primary);
`;
```

3. **Prefer Tailwind for Static Styles**

```typescript
// ❌ Bad: Using Emotion for static styles
const Card = styled.div`
  padding: 1rem;
  border-radius: 0.5rem;
  background: white;
`;

// ✅ Good: Use Tailwind for static styles
<div className="rounded-lg bg-white p-4">
```

## 3. CSS Modules (Optional)

**Use for:** When you need traditional CSS with scoping but don't need runtime dynamics.

### Setup

CSS Modules work out of the box with Next.js. Create a `.module.css` file:

```css
/* components/card.module.css */
.card {
  padding: 1.5rem;
  border-radius: 0.5rem;
  background: white;
  border: 1px solid #e5e7eb;
}

.card:hover {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.cardTitle {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}
```

### Usage

```typescript
import styles from './card.module.css';

export function Card({ title, children }) {
  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>{title}</h3>
      {children}
    </div>
  );
}
```

### Combining with Tailwind

```typescript
import styles from './card.module.css';

export function Card({ title, children }) {
  return (
    <div className={`${styles.card} hover:shadow-lg transition-shadow`}>
      <h3 className={styles.cardTitle}>{title}</h3>
      {children}
    </div>
  );
}
```

## When to Use What

### Server Components (Default)

```typescript
// ✅ Use Tailwind
export default function ServerCard() {
  return (
    <div className="rounded-lg border p-6">
      <h3 className="text-xl font-semibold">Title</h3>
    </div>
  );
}
```

### Client Component with Static Styles

```typescript
'use client';

// ✅ Use Tailwind
export function ClientCard() {
  const [count, setCount] = useState(0);

  return (
    <div className="rounded-lg border p-6">
      <button
        onClick={() => setCount(count + 1)}
        className="rounded bg-blue-500 px-4 py-2 text-white"
      >
        Count: {count}
      </button>
    </div>
  );
}
```

### Client Component with Dynamic Styles

```typescript
'use client';

import styled from '@emotion/styled';

// ✅ Use Emotion
const Card = styled.div<{ isActive: boolean }>`
  padding: 1.5rem;
  border-radius: 0.5rem;
  background: ${(props) => props.isActive ? '#dbeafe' : 'white'};
  border: 2px solid ${(props) => props.isActive ? '#3b82f6' : '#e5e7eb'};
`;

export function DynamicCard({ isActive }) {
  return (
    <Card isActive={isActive}>
      <h3>Dynamic Card</h3>
    </Card>
  );
}
```

### Client Component with Theme Switching

```typescript
'use client';

import { ThemeProvider } from '@emotion/react';
import styled from '@emotion/styled';
import { useTheme } from '@/stores/theme';

const Container = styled.div`
  background: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.text};
`;

export function ThemedSection({ children }) {
  const { theme } = useTheme(); // Zustand store

  return (
    <ThemeProvider theme={theme}>
      <Container>{children}</Container>
    </ThemeProvider>
  );
}
```

## Common Patterns

### Pattern 1: Card Component

```typescript
// Server Component version (Tailwind)
export function ServerCard({ title, description }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
    </div>
  );
}

// Client Component version with dynamic styling (Emotion)
'use client';

import styled from '@emotion/styled';

const Card = styled.div<{ variant: 'default' | 'primary' | 'danger' }>`
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid;
  background: ${(props) => {
    switch (props.variant) {
      case 'primary': return '#dbeafe';
      case 'danger': return '#fee2e2';
      default: return 'white';
    }
  }};
  border-color: ${(props) => {
    switch (props.variant) {
      case 'primary': return '#3b82f6';
      case 'danger': return '#ef4444';
      default: return '#e5e7eb';
    }
  }};
`;

export function DynamicCard({ title, description, variant = 'default' }) {
  return (
    <Card variant={variant}>
      <h3>{title}</h3>
      <p>{description}</p>
    </Card>
  );
}
```

### Pattern 2: Button Component

```typescript
// Tailwind version (recommended for most cases)
export function Button({
  children,
  variant = 'primary',
  size = 'medium',
  ...props
}) {
  const baseClasses = 'rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
  };

  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Pattern 3: Responsive Grid

```typescript
// Tailwind (perfect for this)
export function ProjectGrid({ projects }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {projects.map((project) => (
        <ProjectCard key={project.id} {...project} />
      ))}
    </div>
  );
}
```

### Pattern 4: Theme-Aware Component

```typescript
'use client';

import { ThemeProvider, useTheme } from '@emotion/react';
import styled from '@emotion/styled';

const lightTheme = {
  colors: {
    background: '#ffffff',
    text: '#1f2937',
    primary: '#3b82f6',
  },
};

const darkTheme = {
  colors: {
    background: '#1f2937',
    text: '#f9fafb',
    primary: '#60a5fa',
  },
};

const Container = styled.div`
  background: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.text};
  padding: 2rem;
  border-radius: 0.5rem;
`;

const Button = styled.button`
  background: ${(props) => props.theme.colors.primary};
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
`;

export function ThemedComponent() {
  const [isDark, setIsDark] = useState(false);

  return (
    <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
      <Container>
        <h2>Themed Content</h2>
        <Button onClick={() => setIsDark(!isDark)}>
          Toggle Theme
        </Button>
      </Container>
    </ThemeProvider>
  );
}
```

## Performance Considerations

### 1. Server Components are Faster

```typescript
// ✅ Best: Server Component with Tailwind
export default function FastCard() {
  return <div className="rounded-lg border p-6">Fast</div>;
}

// ⚠️ Slower: Client Component with Emotion
'use client';
const SlowCard = styled.div`
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
`;
```

### 2. Minimize Emotion Usage

```typescript
// ❌ Bad: Everything uses Emotion
'use client';
const Container = styled.div`padding: 1rem;`;
const Title = styled.h1`font-size: 2rem;`;
const Text = styled.p`color: gray;`;

// ✅ Good: Only dynamic parts use Emotion
'use client';
const DynamicCard = styled.div<{ isActive: boolean }>`
  background: ${(props) => props.isActive ? 'blue' : 'white'};
`;

export function Card({ isActive, title, text }) {
  return (
    <DynamicCard isActive={isActive} className="p-4">
      <h1 className="text-2xl">{title}</h1>
      <p className="text-gray-600">{text}</p>
    </DynamicCard>
  );
}
```

### 3. Use CSS Variables for Theme Tokens

```css
/* globals.css - Set at server boundary */
@theme inline {
  --color-primary: #3b82f6;
  --color-text: #1f2937;
}
```

```typescript
// Client component reads variables (no JS needed)
const Button = styled.button`
  background: var(--color-primary);
  color: var(--color-text);
`;
```

## Troubleshooting

### Issue: Emotion styles not applying

**Solution:** Ensure the component is marked as `'use client'`:

```typescript
'use client'; // Required!

import styled from '@emotion/styled';
```

### Issue: Tailwind classes not working

**Solution:** Check that `globals.css` is imported in your root layout:

```typescript
// app/layout.tsx
import '@/styles/globals.css'; // Required!
```

### Issue: Hydration mismatch with Emotion

**Solution:** Ensure Emotion is only used in Client Components, not Server Components.

### Issue: Theme not updating

**Solution:** Wrap with `ThemeProvider` and ensure state changes trigger re-render:

```typescript
'use client';

import { ThemeProvider } from '@emotion/react';

export function ThemedApp({ children }) {
  const [theme, setTheme] = useState(lightTheme);

  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
}
```

## Summary

| Scenario                   | Tool                    | Reason                                   |
| -------------------------- | ----------------------- | ---------------------------------------- |
| Server Component           | Tailwind                | Zero runtime, streams well, SEO-friendly |
| Client Component (static)  | Tailwind                | Simpler, smaller bundle                  |
| Client Component (dynamic) | Emotion                 | Runtime styling, theme switching         |
| Theme switching            | Emotion + CSS Variables | Best of both worlds                      |
| Complex animations         | Emotion or CSS Modules  | More control than Tailwind               |
| Responsive layout          | Tailwind                | Built-in responsive utilities            |

**Golden Rule:** Start with Tailwind. Only reach for Emotion when you need runtime dynamics that Tailwind can't handle.
