# Simple Todo API

A simple Todo API built with **Bun**, **TypeScript**, **tRPC**, **Zod**, and **SuperJSON**.

## 🚀 Features

- **⚡ Bun Runtime**: Lightning-fast JavaScript runtime
- **📝 Type Safety**: Full-stack type safety with tRPC and TypeScript
- **✅ Validation**: Input validation with Zod schemas
- **📦 SuperJSON**: Enhanced JSON serialization (Date, Map, Set, BigInt, RegExp)
- ** Logging**: Structured logging with Winston
- **📝 Todo Management**: Complete CRUD operations for todos with priorities, categories, and subtasks

## 📦 Installation

```bash
bun install
```

## 🏃‍♂️ Running the Server

### Development

```bash
bun run dev
```

### Production

```bash
bun run start
```

### Build

```bash
bun run build
```

## 🌍 Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Key variables:

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `CORS_ORIGIN`: CORS allowed origins

## 🔧 API Endpoints

### Base Endpoints

- `GET /` - API information
- `GET /health` - Health check

### tRPC Endpoints

#### � Todo Management (`/trpc/todo.*`)

- `POST /trpc/todo.create` - Create new todo
- `GET /trpc/todo.getById` - Get todo by ID
- `GET /trpc/todo.list` - List todos with filtering/sorting
- `POST /trpc/todo.update` - Update todo
- `POST /trpc/todo.delete` - Delete todo
- `GET /trpc/todo.getStats` - Get todo statistics

## � Example Usage

### 1. Create a Todo

```bash
curl -X POST http://localhost:3000/trpc/todo.create \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "title": "Learn tRPC",
      "description": "Build a simple API with tRPC",
      "priority": "high",
      "category": "learning",
      "tags": ["typescript", "trpc"],
      "estimatedMinutes": 120
    }
  }'
```

### 2. List Todos

```bash
curl "http://localhost:3000/trpc/todo.list?input={}"
```

### 3. Get Todo Statistics

```bash
curl "http://localhost:3000/trpc/todo.getStats"
```

## 🛠️ Technology Stack

### Core

- **[Bun](https://bun.sh)** - JavaScript runtime and package manager
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[tRPC](https://trpc.io/)** - End-to-end typesafe APIs

### Validation & Serialization

- **[Zod](https://zod.dev/)** - TypeScript-first schema validation
- **[SuperJSON](https://github.com/blitz-js/superjson)** - Enhanced JSON serialization

### Logging

- **[winston](https://github.com/winstonjs/winston)** - Structured logging

## 📋 Project Structure

```
src/
├── index.ts                 # Main server file
├── shared/
│   ├── trpc/
│   │   └── trpc.ts          # tRPC setup with SuperJSON
│   └── utils/
│       └── logger.ts        # Logging configuration
├── trpc/
│   └── router.ts            # Main router
└── features/
    └── todo/
        ├── index.ts         # Todo feature exports
        ├── router.ts        # Todo routes
        ├── service.ts       # Todo business logic
        └── schemas.ts       # Todo validation schemas
```

## 📊 SuperJSON Features

SuperJSON enhances the API with support for:

- **Date objects**: Automatically serialized/deserialized
- **Map and Set**: JavaScript collections preserved
- **BigInt**: Large integers supported
- **RegExp**: Regular expressions maintained
- **undefined**: Preserved (unlike standard JSON)

Example response with SuperJSON:

```json
{
  "timestamp": "2024-01-01T00:00:00.000Z", // Date object
  "bigNumber": "123456789012345678901234567890n", // BigInt
  "tags": ["tag1", "tag2"], // Set becomes array with metadata
  "metadata": [
    ["key", "value"],
    ["type", "object"]
  ] // Map becomes array
}
```

## 🚀 Performance

- **Bun Runtime**: Up to 4x faster than Node.js
- **tRPC**: Minimal runtime overhead
- **SuperJSON**: Enhanced serialization without performance penalty

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

---

**Built with ❤️ using Bun and modern TypeScript**
