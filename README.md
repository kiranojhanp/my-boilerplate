# 🎯 LLM-Optimized Full-Stack TypeScript API

A **production-ready**, **LLM-friendly** codebase built with **Bun**, **TypeScript**, **tRPC**, and **React**. Optimized for AI-assisted development with consolidated feature structure.

## 🎯 **Why This Boilerplate Exists**

This boilerplate fills a specific gap in the TypeScript ecosystem. While building projects, I found myself choosing between:

- **Full-stack frameworks** like Next.js, Remix, or SvelteKit - which are excellent but come with their own conventions and constraints
- **SPA frameworks** like React Router - which require separate API setup and deployment complexity

**The Missing Piece**: A simple way to run both SPA and API in a **single process** without committing to a full-stack framework's architecture.

This boilerplate provides exactly that - a **standalone TypeScript API** with an **embedded SPA frontend**, both running in one process while maintaining clear separation of concerns.

**LLM-First Design**: While creating this, I focused on **LLM vibecoding** - making the codebase as readable and predictable as possible for AI-assisted development. The result is a structure that's not only great for humans but excels at AI pair programming.

> 🤖 **For LLMs**: See `llm.txt` in the root for a complete development guide.

## 🚀 **Quick Start**

```bash
# Install dependencies
bun install

# Set up environment
cp .env.example .env

# Start development (with fast HMR)
bun run dev:full
```

**Development URLs:**
- Frontend (Vite): [http://localhost:5173](http://localhost:5173) 
- Backend API: [http://localhost:3000/trpc](http://localhost:3000/trpc)

**Production:**
```bash
# Build and start production server
bun run build:all && bun run start
```
- Full app: [http://localhost:3000](http://localhost:3000)

## 📦 **Tech Stack**

### **Runtime & Language**
- **Bun** - Lightning-fast JavaScript runtime and package manager
- **TypeScript** - Full type safety across the stack

### **Backend**
- **tRPC** - End-to-end typesafe APIs
- **Drizzle ORM** - Type-safe database operations with auto-generated Zod schemas
- **SQLite** - Local database (easily swappable)
- **Zod** - Runtime validation and type inference
- **Winston** - Structured logging

### **Frontend**
- **React 18** - Modern React with hooks and concurrent features
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching (via tRPC)
- **CSS Custom Properties** - Design system without frameworks

### **Development**
- **Vite** - Fast frontend build tool
- **TypeScript Strict Mode** - Maximum type safety
- **Hot Reload** - Backend and frontend live reloading

## 🔧 **Available Scripts**

```bash
# Development (Fast HMR with Vite)
bun run dev              # Backend server only (http://localhost:3000)
bun run dev:web          # Frontend dev server only (http://localhost:5173)  
bun run dev:full         # Both servers concurrently (recommended)

# Production
bun run start            # Production server with built frontend
bun run start:dev        # Development server without NODE_ENV=production

# Building
bun run build            # Build backend
bun run build:web        # Build frontend
bun run build:all        # Build both

# Database
bun run db:generate      # Generate Drizzle migrations
bun run db:migrate       # Run migrations
bun run db:studio        # Open Drizzle Studio

# Feature Development
bun run create-feature <name>  # Generate new feature scaffold

# Code Quality
bun run lint             # ESLint
bun run format           # Prettier
bun test                 # Run tests
```

## 🌍 **Environment Variables**

Copy `.env.example` to `.env`:

```bash
# Server
PORT=3000
NODE_ENV=development

# Database  
DATABASE_URL="file:./todo.db"

# CORS (optional)
CORS_ORIGIN="http://localhost:5173"
```

## 📊 **Example: Todo Feature API**

### **tRPC Endpoints**

The todo feature exposes these endpoints via tRPC:

- `todo.create` - Create new todo
- `todo.list` - List todos with filtering/sorting  
- `todo.getById` - Get todo by ID
- `todo.update` - Update todo
- `todo.delete` - Delete todo
- `todo.getStats` - Get todo statistics

### **Usage Examples**

```typescript
// Frontend usage with tRPC hooks
const { data: todos } = trpc.todo.list.useQuery({ priority: 'high' })
const createTodo = trpc.todo.create.useMutation()

// Create a new todo
await createTodo.mutateAsync({
  title: "Learn tRPC",
  description: "Build a simple API with tRPC", 
  priority: "high",
  category: "learning"
})
```

## 📁 **Project Structure**

```
basic-api/
├── src/
│   ├── backend/           🖥️  Server infrastructure
│   │   ├── main.ts        # Server entry point
│   │   ├── router.ts      # Main tRPC router
│   │   ├── database.ts    # Database setup
│   │   ├── schemas.ts     # Database schemas
│   │   ├── trpc.ts        # tRPC configuration
│   │   └── utils.ts       # Server utilities
│   ├── frontend/          🌐  Client infrastructure  
│   │   ├── index.html     # HTML template
│   │   ├── app.tsx        # React app root
│   │   ├── router.tsx     # React Router setup
│   │   ├── components.tsx # Global components
│   │   ├── styles.css     # Design system
│   │   └── utils.ts       # Frontend utilities
│   └── features/          🎯  Business features
│       └── todo/          # Example feature
│           ├── types.ts   # Schemas & types (Drizzle + Zod)
│           ├── backend.ts # Server logic
│           ├── frontend.tsx # Client logic
│           ├── routes.tsx # Route config
│           └── index.ts   # Exports
├── scripts/
│   └── create-feature.ts  # Feature generator
├── docs/                  # Documentation
├── drizzle/              # Database migrations
├── llm.txt               # LLM development guide
└── dist/                 # Build output
```

## 🎸 **Ready for LLM-Powered Development!**

This codebase is optimized for AI assistance. LLMs can:
- ✅ Understand entire features in single context windows
- ✅ Generate new features using the established patterns
- ✅ Modify existing features without breaking dependencies
- ✅ Navigate the codebase easily with predictable structure

**Start coding with AI assistance - the structure is designed for excellent LLM support!** 🚀
