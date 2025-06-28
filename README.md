# Basic API

A scalable, production-ready API built with **Bun**, **TypeScript**, **tRPC**, **Zod**, **SuperJSON**, and **Authentication**.

## 🚀 Features

- **⚡ Bun Runtime**: Lightning-fast JavaScript runtime
- **🔒 Authentication**: JWT-based auth with Bun's built-in password hashing (Argon2)
- **📝 Type Safety**: Full-stack type safety with tRPC and TypeScript
- **✅ Validation**: Input validation with Zod schemas
- **📦 SuperJSON**: Enhanced JSON serialization (Date, Map, Set, BigInt, RegExp)
- **📊 Metrics**: Prometheus metrics with custom dashboards
- **🛡️ Security**: Rate limiting, CORS, security headers
- **📋 Logging**: Structured logging with Winston
- **🏥 Health Checks**: Kubernetes-ready health endpoints

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

- `JWT_SECRET`: Secret key for JWT tokens (change in production!)
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `CORS_ORIGIN`: CORS allowed origins

## 🔧 API Endpoints

### Base Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `GET /metrics` - Prometheus metrics

### tRPC Endpoints

#### 🔒 Authentication (`/trpc/auth.*`)

- `POST /trpc/auth.register` - Register new user
- `POST /trpc/auth.login` - Login user
- `POST /trpc/auth.refresh` - Refresh access token
- `GET /trpc/auth.me` - Get current user (requires auth)
- `POST /trpc/auth.updateProfile` - Update user profile (requires auth)
- `POST /trpc/auth.changePassword` - Change password (requires auth)
- `POST /trpc/auth.deleteAccount` - Delete account (requires auth)

#### � Todo Management (`/trpc/todo.*`)

- `POST /trpc/todo.create` - Create new todo (requires auth)
- `GET /trpc/todo.getById` - Get todo by ID (requires auth)
- `GET /trpc/todo.list` - List todos with filtering/sorting (requires auth)
- `POST /trpc/todo.update` - Update todo (requires auth)
- `POST /trpc/todo.delete` - Delete todo (requires auth)
- `POST /trpc/todo.addSubtask` - Add subtask (requires auth)
- `POST /trpc/todo.updateSubtask` - Update subtask (requires auth)
- `POST /trpc/todo.deleteSubtask` - Delete subtask (requires auth)
- `GET /trpc/todo.getStats` - Get todo statistics (requires auth)
- `POST /trpc/todo.bulkUpdate` - Bulk update todos (requires auth)

#### �👋 Hello Endpoints (`/trpc/hello.*`)

- `GET /trpc/hello.hello` - Simple hello world
- `GET /trpc/hello.helloName` - Personalized greeting
- `POST /trpc/hello.customHello` - Custom message
- `GET /trpc/hello.protectedHello` - Protected endpoint (requires auth)
- `GET /trpc/hello.complexData` - SuperJSON demo with complex types

#### 🏥 Health Endpoints (`/trpc/health.*`)

- `GET /trpc/health.check` - Detailed health check
- `GET /trpc/health.ready` - Kubernetes readiness probe
- `GET /trpc/health.live` - Kubernetes liveness probe

## 🔑 Authentication Flow

### 1. Register a User

```bash
curl -X POST http://localhost:3000/trpc/auth.register \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "email": "user@example.com",
      "username": "myuser",
      "password": "SecurePass123!"
    }
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/trpc/auth.login \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "email": "user@example.com",
      "password": "SecurePass123!"
    }
  }'
```

### 3. Use Protected Endpoints

```bash
curl http://localhost:3000/trpc/auth.me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Start the server first
bun run dev

# In another terminal, run basic tests
bun run test-api.ts

# Or run enhanced feature tests
bun run test:enhanced

# Or run todo API tests
bun run test:todo
```

The test suite covers:

- ✅ Health checks
- ✅ SuperJSON serialization (Date, Map, Set, BigInt, RegExp)
- ✅ Advanced Zod validation with custom refinements
- ✅ User registration and login with enhanced security
- ✅ Protected routes and JWT token management
- ✅ Account lockout protection
- ✅ File upload validation
- ✅ Batch data processing
- ✅ Complex search filtering
- ✅ Password strength analysis
- ✅ Bun crypto utilities
- ✅ Todo CRUD operations
- ✅ Subtask management
- ✅ Todo statistics and analytics
- ✅ Bulk operations
- ✅ Error handling

## 🛠️ Technology Stack

### Core

- **[Bun](https://bun.sh)** - JavaScript runtime and package manager
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[tRPC](https://trpc.io/)** - End-to-end typesafe APIs

### Validation & Serialization

- **[Zod](https://zod.dev/)** - TypeScript-first schema validation
- **[SuperJSON](https://github.com/blitz-js/superjson)** - Enhanced JSON serialization

### Authentication & Security

- **[Bun.password](https://bun.sh/docs/api/hashing)** - Argon2 password hashing
- **[jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)** - JWT tokens
- **[rate-limiter-flexible](https://github.com/animir/node-rate-limiter-flexible)** - Rate limiting

### Monitoring & Observability

- **[prom-client](https://github.com/siimon/prom-client)** - Prometheus metrics
- **[winston](https://github.com/winstonjs/winston)** - Structured logging

## 📋 Project Structure

```
src/
├── index.ts                 # Main server file
├── middleware/
│   ├── metrics.ts          # Prometheus metrics
│   └── rateLimiter.ts      # Rate limiting
├── trpc/
│   ├── trpc.ts             # tRPC setup with SuperJSON
│   ├── router.ts           # Main router
│   └── routers/
│       ├── auth.ts         # Authentication endpoints
│       ├── hello.ts        # Hello world endpoints
│       └── health.ts       # Health check endpoints
└── utils/
    ├── auth.ts             # Authentication utilities
    └── logger.ts           # Logging configuration
```

## 🔒 Security Features

- **Password Hashing**: Argon2 with Bun.password
- **JWT Tokens**: Secure token-based authentication
- **Rate Limiting**: Configurable rate limits per endpoint
- **CORS**: Cross-origin resource sharing protection
- **Security Headers**: XSS, CSRF, and other security headers
- **Input Validation**: Zod schema validation for all inputs

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

## 🐳 Docker Deployment

```bash
# Build image
bun run docker:build

# Run container
bun run docker:run

# Docker Compose
bun run compose:up
```

## ☸️ Kubernetes Deployment

```bash
# Deploy to Kubernetes
bun run k8s:deploy

# Remove from Kubernetes
bun run k8s:delete
```

## 🚀 Performance

- **Bun Runtime**: Up to 4x faster than Node.js
- **tRPC**: Minimal runtime overhead
- **Argon2**: Secure yet efficient password hashing
- **Connection Pooling**: Efficient resource usage
- **Prometheus Metrics**: Real-time performance monitoring

## 📈 Monitoring

Access metrics at `http://localhost:3000/metrics` for:

- HTTP request duration and count
- Memory usage
- Active connections
- Rate limit hits
- Custom business metrics

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
