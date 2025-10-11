# Font Awesome Usage Guide

## Tree-Shakeable Icon Imports

This project uses Font Awesome with tree-shaking enabled to minimize bundle size. Follow these patterns to ensure only the icons you use are included in the final bundle.

## Available Packages

This project includes all three Font Awesome free icon packages:

- `@fortawesome/free-solid-svg-icons` - Filled icons
- `@fortawesome/free-regular-svg-icons` - Outlined icons
- `@fortawesome/free-brands-svg-icons` - Brand logos

All packages support tree-shaking when imported correctly.

## Quick Start

### 1. Import Specific Icons

```typescript
import { faUser, faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faHeart, faStar } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
```

### 2. Use in Components

```typescript
export function ContactInfo() {
  return (
    <div>
      <FontAwesomeIcon icon={faEnvelope} />
      <FontAwesomeIcon icon={faPhone} size="lg" />
      <FontAwesomeIcon icon={faUser} className="text-blue-500" />
    </div>
  )
}
```

## Available Icon Packages

### Solid Icons (`@fortawesome/free-solid-svg-icons`)

General purpose filled icons for UI elements.

**Common examples:**

- `faUser`, `faUsers`, `faUserCircle`
- `faHome`, `faSearch`, `faBars`
- `faCheck`, `faTimes`, `faPlus`
- `faArrowRight`, `faArrowLeft`, `faChevronDown`

### Regular Icons (`@fortawesome/free-regular-svg-icons`)

Outlined variants of solid icons.

**Common examples:**

- `faHeart`, `faStar`, `faBookmark`
- `faCircle`, `faSquare`, `faCheckCircle`

### Brand Icons (`@fortawesome/free-brands-svg-icons`)

Social media and company logos.

**Common examples:**

- `faGithub`, `faTwitter`, `faLinkedin`
- `faFacebook`, `faInstagram`, `faYoutube`
- `faReact`, `faNode`, `faDocker`

## Styling Icons

### Size

```typescript
<FontAwesomeIcon icon={faUser} size="xs" />
<FontAwesomeIcon icon={faUser} size="sm" />
<FontAwesomeIcon icon={faUser} size="lg" />
<FontAwesomeIcon icon={faUser} size="2x" />
<FontAwesomeIcon icon={faUser} size="3x" />
```

### Color (with Tailwind)

```typescript
<FontAwesomeIcon icon={faUser} className="text-blue-500" />
<FontAwesomeIcon icon={faUser} className="text-red-600 hover:text-red-700" />
```

### Color (with inline styles)

```typescript
<FontAwesomeIcon icon={faUser} style={{ color: '#3b82f6' }} />
```

### Rotation & Flip

```typescript
<FontAwesomeIcon icon={faUser} rotation={90} />
<FontAwesomeIcon icon={faUser} flip="horizontal" />
<FontAwesomeIcon icon={faUser} flip="vertical" />
```

### Spin & Pulse

```typescript
<FontAwesomeIcon icon={faSpinner} spin />
<FontAwesomeIcon icon={faCircleNotch} pulse />
```

## Advanced Patterns

### Creating Icon Components

```typescript
// components/icons/UserIcon.tsx
import { faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { FontAwesomeIconProps } from '@fortawesome/react-fontawesome'

export function UserIcon(props: Omit<FontAwesomeIconProps, 'icon'>) {
  return <FontAwesomeIcon icon={faUser} {...props} />
}
```

### Conditional Icons

```typescript
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons'
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons'

function LikeButton({ isLiked }: { isLiked: boolean }) {
  return (
    <FontAwesomeIcon
      icon={isLiked ? faHeartSolid : faHeartRegular}
      className={isLiked ? 'text-red-500' : 'text-gray-400'}
    />
  )
}
```

### Icon with Text

```typescript
function Button() {
  return (
    <button className="flex items-center gap-2">
      <FontAwesomeIcon icon={faPlus} />
      <span>Add Item</span>
    </button>
  )
}
```

## Bundle Size Optimization

### ✅ DO: Import Only What You Need

```typescript
// Only these 3 icons will be in your bundle
import { faUser, faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';
```

### ❌ DON'T: Import Entire Libraries

```typescript
// This imports ALL icons (~1MB+)
import * as Icons from '@fortawesome/free-solid-svg-icons';

// This also imports ALL icons
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
library.add(fas);
```

### Lazy Loading for Icon-Heavy Routes

If a specific route uses many icons, consider code-splitting:

```typescript
// app/icons-showcase/page.tsx
import { lazy, Suspense } from 'react'

const IconGallery = lazy(() => import('./IconGallery'))

export default function IconsPage() {
  return (
    <Suspense fallback={<div>Loading icons...</div>}>
      <IconGallery />
    </Suspense>
  )
}
```

## Finding Icons

Browse available icons at: [Font Awesome icon search](https://fontawesome.com/search?o=r&m=free)

**Note**: This project uses Font Awesome Free. All free icons are available for use.

## TypeScript Support

All icon imports are fully typed:

```typescript
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faUser } from '@fortawesome/free-solid-svg-icons';

const myIcon: IconDefinition = faUser;
```

## Troubleshooting

### Icon Not Displaying

1. Verify the icon is imported from the correct package
2. Check that `FontAwesomeIcon` component is imported
3. Ensure the icon name matches exactly (case-sensitive)

### Bundle Size Still Large

1. Search codebase for `import *` patterns
2. Check for `library.add()` usage
3. Verify no barrel imports of entire icon packages

### Icon Name Conflicts

When importing icons with the same name from different packages:

```typescript
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
```

## Resources

- [Font Awesome React Documentation](https://fontawesome.com/docs/web/use-with/react)
- [Icon Search](https://fontawesome.com/search?o=r&m=free)
- [Tree Shaking Guide](https://fontawesome.com/docs/web/dig-deeper/tree-shaking)
