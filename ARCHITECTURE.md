# Todo App - Clean Code Structure

## 🏗️ Architecture Overview

The application follows a clean, modular architecture with clear separation of concerns:

### 📁 Project Structure

```
src/
├── web/
│   ├── shared/
│   │   ├── components/     # Reusable UI components
│   │   ├── styles/         # Design tokens & global styles
│   │   ├── lib/            # Utilities (tRPC, SSR)
│   │   └── types/          # TypeScript type definitions
│   │
│   ├── features/
│   │   └── todo/
│   │       ├── components/ # Feature-specific components
│   │       └── hooks/      # React Query hooks for data
│   │
│   ├── app.css            # Global styles with design tokens
│   ├── app.tsx            # Client entry point
│   └── app.ssr.tsx        # Server-side rendering setup
│
└── server/
    ├── features/
    │   └── todo/          # Backend business logic
    └── shared/            # Server utilities
```

## 🎨 Design System

### Design Tokens

- **Colors**: Primary, secondary, success, warning, danger palettes
- **Spacing**: Consistent scale (xs, sm, md, lg, xl, 2xl)
- **Typography**: Font sizes, weights, and line heights
- **Border Radius**: Unified rounding (sm, md, lg, xl, full)
- **Shadows**: Elevation system (sm, md, lg)

### Component Library

- **Button**: Multiple variants and sizes
- **Input/Textarea/Select**: Form components with validation
- **Modal**: Overlay dialogs with keyboard support
- **Badge**: Status and category indicators
- **Card**: Content containers
- **ErrorAlert**: User-friendly error display

## 🚀 Performance Features

1. **Server-Side Rendering (SSR)**
   - Pre-fetches data on server
   - Prevents loading states
   - SEO-friendly

2. **CSS Modules**
   - Scoped styling
   - No naming conflicts
   - Tree-shakable

3. **Design Tokens**
   - Consistent theming
   - Easy maintenance
   - CSS custom properties

## 🧩 Code Quality

### Clean Code Principles

- Single Responsibility Principle
- Component composition over inheritance
- Consistent naming conventions
- TypeScript for type safety

### Modern React Patterns

- Custom hooks for data fetching
- Memo for performance optimization
- Proper error boundaries
- Accessible components

## 📱 Responsive Design

- Mobile-first approach
- Flexible grid layouts
- Touch-friendly interactions
- Adaptive typography
