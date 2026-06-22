# dailyRojgar — Production Engineering Workflow

> Full-stack MERN marketplace for daily wage workers and service seekers.
> Treat every phase as a production sprint — no throwaway code.

---

## Table of Contents

1. ✅ [Phase 0 — Foundation & Tooling](#phase-0--foundation--tooling)
2. ✅ [Phase 1 — System Design & Architecture](#phase-1--system-design--architecture)
3. ✅ [Phase 2 — Database Design & Schemas](#phase-2--database-design--schemas)
4. ✅ [Phase 3 — Backend Core](#phase-3--backend-core)
5. ⏳ [Phase 4 — Authentication & Security](#phase-4--authentication--security)
6. ⏳ [Phase 5 — Domain APIs](#phase-5--domain-apis)
7. ⏳ [Phase 6 — Realtime Layer](#phase-6--realtime-layer)
8. ✅ [Phase 7 — Frontend Architecture](#phase-7--frontend-architecture)
9. ⏳ [Phase 8 — Frontend Pages & Flows](#phase-8--frontend-pages--flows)
10. ⏳ [Phase 9 — Payment System](#phase-9--payment-system)
11. ⏳ [Phase 10 — Notifications & Queues](#phase-10--notifications--queues)
12. ⏳ [Phase 11 — Admin System](#phase-11--admin-system)
13. ⏳ [Phase 12 — AI Features](#phase-12--ai-features)
14. ⏳ [Phase 13 — Testing](#phase-13--testing)
15. ✅ [Phase 14 — DevOps & Deployment](#phase-14--devops--deployment)
16. ⏳ [Phase 15 — Monitoring & Observability](#phase-15--monitoring--observability)
17. [Appendix — API Contract](#appendix--api-contract)
18. [Appendix — Folder Structure](#appendix--folder-structure)

---

## Phase 0 — Foundation & Tooling ✅

**Goal:** Establish the monorepo, toolchain, and conventions before any feature code is written.

### 0.1 Monorepo Setup

```
dailyRojgar/
├── apps/
│   ├── client/          # React + TypeScript (Vite)
│   └── server/          # Node + Express + TypeScript
├── packages/
│   ├── shared-types/    # Shared TS interfaces (User, Booking, etc.)
│   └── shared-utils/    # Pure utility functions reused by both apps
├── docker/
├── .github/
│   └── workflows/
├── workflow.md
├── docker-compose.yml
└── package.json         # Workspace root
```

- Tool: **npm workspaces** (or pnpm workspaces)
- Node version: lock via `.nvmrc` (v20 LTS)
- TypeScript: strict mode, shared `tsconfig.base.json`

### 0.2 Code Quality Gates

| Tool        | Purpose                             |
| ----------- | ----------------------------------- |
| Prettier    | Formatting — single source of truth |
| Husky       | Git hooks                           |
| lint-staged | Only lint changed files on commit   |
| commitlint  | Conventional commits enforcement    |

### 0.3 Environment Strategy

```
.env.development      # local dev
.env.test             # test runner
.env.production       # injected by CI/CD — never committed
.env.example          # committed template with empty values
```

**All secrets via env vars. No hardcoded values anywhere.**

### 0.4 Branch Strategy

```
main          ← production
staging       ← pre-production integration
develop       ← active development base
feature/*     ← individual features
fix/*         ← bug fixes
chore/*       ← tooling, deps, config
```

---

## Phase 1 — System Design & Architecture ✅

**Goal:** Define the complete system topology before writing a single API or component.

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                        │
│   React SPA (Vite) — served via CDN / Nginx             │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTPS
┌─────────────────────▼───────────────────────────────────┐
│                    API GATEWAY / NGINX                    │
│   Rate limiting · SSL termination · Load balancing       │
└────────┬───────────────────────┬────────────────────────┘
         │                       │
┌────────▼──────┐     ┌──────────▼──────────┐
│  REST API      │     │  Socket.io Server    │
│  Express.js    │     │  (realtime layer)    │
└────────┬──────┘     └──────────┬───────────┘
         │                       │
┌────────▼───────────────────────▼────────────────────────┐
│                     SERVICE LAYER                        │
│  AuthService · WorkerService · BookingService            │
│  PaymentService · NotificationService · SearchService    │
└────────┬───────────────────────┬────────────────────────┘
         │                       │
┌────────▼──────┐     ┌──────────▼──────────┐
│  MongoDB       │     │  Redis               │
│  (Primary DB)  │     │  Cache · Sessions    │
└───────────────┘     │  BullMQ Queues       │
                       └─────────────────────┘
```

### 1.2 Backend Architecture Pattern

**Layered Clean Architecture**

```
Request → Router → Middleware → Controller → Service → Repository → Database
```

- **Router**: path + method binding only
- **Middleware**: auth, validation, rate limit
- **Controller**: thin — parse request, call service, send response
- **Service**: all business logic lives here
- **Repository**: all database queries live here (never in controllers or services)
- **Model**: Mongoose schema + instance methods only

### 1.3 Frontend Architecture Pattern

```
Page (route component)
  └── Feature modules (domain-specific logic)
        └── UI Components (dumb, reusable)
              └── Design tokens (Tailwind config)
```

State management:

- **Server state**: React Query (TanStack Query)
- **Client/UI state**: Zustand
- **Form state**: React Hook Form + Zod

### 1.4 Multi-Role Access Model

```
Role        Permissions
────────    ─────────────────────────────────────────
CUSTOMER    Search, Book, Pay, Chat, Review
WORKER      Profile, Accept Jobs, Earnings, Documents
ADMIN       Full platform access + verification
```

- Role stored in JWT payload
- Route guards on frontend
- Middleware authorization on backend

### 1.5 Service Categories (Seed Data)

```
ID  Category           Sub-skills
──  ─────────────────  ────────────────────────────────────
1   Construction       Mason, Carpenter, Labour, Welder
2   Electrical         Wiring, Installation, Repair
3   Plumbing           Pipe fitting, Leak repair, Sanitation
4   Cleaning           Home, Office, Deep clean, Post-construction
5   House Help         Cook, Maid, Baby sitter, Elder care
6   Painting           Interior, Exterior, Waterproofing
7   Repairs            AC, Appliance, Furniture, Mobile
8   Driving            Personal driver, Delivery, Shifting
9   Gardening          Landscaping, Pruning, Maintenance
10  Sanitation         Drain cleaning, Pest control
```

---

## Phase 2 — Database Design & Schemas ✅

**Goal:** Define all MongoDB collections, indexes, and relationships before any query is written.

### 2.1 Collections Overview

```
users
workers
services
bookings
payments
reviews
notifications
chats
messages
otps
admin_logs
```

### 2.2 Schema Definitions

#### users

```typescript
{
  _id: ObjectId,
  name: string,                    // required, 2–60 chars
  email: string,                   // unique, lowercase, indexed
  phone: string,                   // unique, E.164 format
  password: string,                // bcrypt hashed
  role: 'customer' | 'worker' | 'admin',
  profileImage: string | null,     // S3/CDN URL
  isActive: boolean,               // default true
  isVerified: boolean,             // phone/email verified
  location: {
    type: 'Point',
    coordinates: [longitude, latitude]
  },
  address: {
    street: string,
    city: string,
    state: string,
    pincode: string
  },
  createdAt: Date,
  updatedAt: Date
}

Indexes:
  { email: 1 }            unique
  { phone: 1 }            unique
  { location: '2dsphere' } geo queries
  { role: 1, isActive: 1 } compound
```

#### workers

```typescript
{
  _id: ObjectId,
  userId: ObjectId,               // ref: users
  skills: [{
    categoryId: ObjectId,         // ref: services
    name: string,
    yearsExperience: number
  }],
  bio: string,                    // max 500 chars
  documents: [{
    type: 'aadhaar' | 'pan' | 'photo' | 'certificate',
    url: string,                  // S3 URL
    verifiedAt: Date | null
  }],
  verificationStatus: 'pending' | 'under_review' | 'approved' | 'rejected',
  rejectionReason: string | null,
  availability: {
    isAvailable: boolean,
    workingDays: ['mon','tue','wed','thu','fri','sat','sun'],
    workingHours: { from: string, to: string }  // "08:00", "20:00"
  },
  pricePerDay: number,
  rating: {
    average: number,              // 0.0 – 5.0, maintained via aggregation
    totalReviews: number
  },
  stats: {
    completedJobs: number,
    cancelledJobs: number,
    totalEarnings: number
  },
  isAvailableNow: boolean,        // toggled by worker in real-time
  createdAt: Date,
  updatedAt: Date
}

Indexes:
  { userId: 1 }           unique
  { verificationStatus: 1, 'availability.isAvailable': 1 }
  { 'skills.categoryId': 1 }
  { 'rating.average': -1 }
  { pricePerDay: 1 }
```

#### services

```typescript
{
  _id: ObjectId,
  name: string,
  slug: string,                   // unique, URL-safe
  category: string,
  description: string,
  icon: string,                   // icon name or URL
  priceRange: { min: number, max: number },
  isActive: boolean,
  sortOrder: number,
  createdAt: Date
}

Indexes:
  { slug: 1 }    unique
  { category: 1, isActive: 1 }
```

#### bookings

```typescript
{
  _id: ObjectId,
  bookingNumber: string,          // DR-2024-000001 (auto-generated)
  customerId: ObjectId,           // ref: users
  workerId: ObjectId,             // ref: workers
  serviceId: ObjectId,            // ref: services
  status: 'pending' | 'accepted' | 'in_progress' | 'completed'
        | 'cancelled' | 'disputed',
  scheduledDate: Date,
  scheduledTime: string,          // "10:00"
  estimatedHours: number,
  location: {
    type: 'Point',
    coordinates: [longitude, latitude],
    address: string               // human-readable
  },
  notes: string,                  // customer instructions
  pricing: {
    baseAmount: number,
    platformFee: number,          // 10% of base
    totalAmount: number,
    currency: 'INR'
  },
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed',
  paymentMethod: 'online' | 'cash',
  cancellationReason: string | null,
  cancelledBy: 'customer' | 'worker' | 'admin' | null,
  completedAt: Date | null,
  createdAt: Date,
  updatedAt: Date
}

Indexes:
  { bookingNumber: 1 }    unique
  { customerId: 1, status: 1 }
  { workerId: 1, status: 1 }
  { scheduledDate: 1 }
  { status: 1, createdAt: -1 }
```

#### payments

```typescript
{
  _id: ObjectId,
  bookingId: ObjectId,            // ref: bookings
  customerId: ObjectId,           // ref: users
  workerId: ObjectId,             // ref: workers
  amount: number,
  currency: 'INR',
  status: 'created' | 'authorized' | 'captured' | 'failed' | 'refunded',
  method: 'online' | 'cash',
  gateway: 'razorpay' | 'cash' | null,
  gatewayOrderId: string | null,
  gatewayPaymentId: string | null,
  gatewaySignature: string | null,
  workerPayout: number,           // amount after platform cut
  platformFee: number,
  refundId: string | null,
  refundedAt: Date | null,
  metadata: Record<string, unknown>,
  createdAt: Date,
  updatedAt: Date
}

Indexes:
  { bookingId: 1 }        unique
  { customerId: 1 }
  { workerId: 1 }
  { status: 1 }
  { gatewayOrderId: 1 }
```

#### reviews

```typescript
{
  _id: ObjectId,
  bookingId: ObjectId,            // ref: bookings — ensures one review per booking
  customerId: ObjectId,           // ref: users
  workerId: ObjectId,             // ref: workers
  rating: number,                 // 1 – 5 integer
  comment: string,                // max 500 chars
  isPublic: boolean,
  reply: string | null,           // worker's reply
  repliedAt: Date | null,
  createdAt: Date
}

Indexes:
  { bookingId: 1 }        unique
  { workerId: 1, isPublic: 1 }
  { customerId: 1 }
```

#### chats

```typescript
{
  _id: ObjectId,
  bookingId: ObjectId,
  participants: [ObjectId, ObjectId],  // [customerId, workerId]
  lastMessage: {
    text: string,
    senderId: ObjectId,
    sentAt: Date
  },
  isActive: boolean,
  createdAt: Date
}

Indexes:
  { bookingId: 1 }        unique
  { participants: 1 }
```

#### messages

```typescript
{
  _id: ObjectId,
  chatId: ObjectId,               // ref: chats
  senderId: ObjectId,
  text: string,
  type: 'text' | 'image' | 'location',
  mediaUrl: string | null,
  isRead: boolean,
  readAt: Date | null,
  createdAt: Date
}

Indexes:
  { chatId: 1, createdAt: 1 }
  { senderId: 1 }
```

#### notifications

```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  type: 'booking_new' | 'booking_accepted' | 'booking_completed'
      | 'payment_received' | 'review_received' | 'chat_message'
      | 'worker_approved' | 'system',
  title: string,
  body: string,
  data: Record<string, unknown>,  // deep link data
  isRead: boolean,
  readAt: Date | null,
  createdAt: Date
}

Indexes:
  { userId: 1, isRead: 1 }
  { userId: 1, createdAt: -1 }
```

### 2.3 Indexing Strategy Summary

- All foreign key fields: indexed
- All status + date compound queries: compound indexes
- Geo-queries: 2dsphere on `location` fields
- Text search: text index on `workers.bio`, `services.name`
- TTL index: `otps` collection — auto-expire in 10 minutes

---

## Phase 3 — Backend Core ✅

**Goal:** Scaffold the complete Express application skeleton with all layers in place.

### 3.1 Folder Structure

```
apps/server/src/
├── config/
│   ├── database.ts          # Mongoose connection
│   ├── redis.ts             # Redis client (ioredis)
│   ├── env.ts               # Validated env vars (zod)
│   └── constants.ts         # App-wide constants
│
├── models/
│   ├── User.model.ts
│   ├── Worker.model.ts
│   ├── Service.model.ts
│   ├── Booking.model.ts
│   ├── Payment.model.ts
│   ├── Review.model.ts
│   ├── Chat.model.ts
│   ├── Message.model.ts
│   └── Notification.model.ts
│
├── repositories/            # All DB queries — no business logic
│   ├── user.repository.ts
│   ├── worker.repository.ts
│   ├── booking.repository.ts
│   ├── payment.repository.ts
│   ├── review.repository.ts
│   └── notification.repository.ts
│
├── services/                # All business logic — no DB calls
│   ├── auth.service.ts
│   ├── worker.service.ts
│   ├── booking.service.ts
│   ├── payment.service.ts
│   ├── search.service.ts
│   ├── notification.service.ts
│   ├── chat.service.ts
│   └── admin.service.ts
│
├── controllers/             # Parse req → call service → send res
│   ├── auth.controller.ts
│   ├── worker.controller.ts
│   ├── booking.controller.ts
│   ├── payment.controller.ts
│   ├── review.controller.ts
│   ├── search.controller.ts
│   └── admin.controller.ts
│
├── routes/
│   ├── index.ts             # Mount all routers
│   ├── auth.routes.ts
│   ├── worker.routes.ts
│   ├── booking.routes.ts
│   ├── payment.routes.ts
│   ├── review.routes.ts
│   ├── search.routes.ts
│   ├── notification.routes.ts
│   └── admin.routes.ts
│
├── middleware/
│   ├── auth.middleware.ts   # JWT verification
│   ├── role.middleware.ts   # Role-based access
│   ├── validate.middleware.ts  # Zod schema validation
│   ├── rateLimit.middleware.ts
│   ├── upload.middleware.ts # Multer + S3
│   └── error.middleware.ts  # Global error handler
│
├── validators/              # Zod schemas for every request body
│   ├── auth.validator.ts
│   ├── worker.validator.ts
│   ├── booking.validator.ts
│   └── search.validator.ts
│
├── queues/                  # BullMQ job definitions
│   ├── email.queue.ts
│   ├── sms.queue.ts
│   ├── notification.queue.ts
│   └── payout.queue.ts
│
├── jobs/                    # BullMQ workers (processors)
│   ├── email.job.ts
│   ├── sms.job.ts
│   ├── notification.job.ts
│   └── payout.job.ts
│
├── utils/
│   ├── ApiResponse.ts       # Standardised response wrapper
│   ├── ApiError.ts          # Custom error class
│   ├── logger.ts            # Winston logger
│   ├── pagination.ts        # Cursor/offset pagination helpers
│   ├── geocoder.ts          # Coordinate utilities
│   ├── tokenizer.ts         # JWT sign/verify helpers
│   └── bookingNumber.ts     # DR-YYYY-NNNNNN generator
│
├── sockets/
│   ├── index.ts             # Socket.io init + namespace setup
│   ├── chat.socket.ts       # Chat events
│   └── notification.socket.ts
│
└── app.ts                   # Express app factory
    server.ts                # HTTP server entry point
```

### 3.2 Standard API Response Shape

Every API endpoint must return one of these shapes — no exceptions.

**Success**

```json
{
  "success": true,
  "message": "Workers fetched successfully",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 143
  }
}
```

**Error**

```json
{
  "success": false,
  "message": "Worker not found",
  "errorCode": "WORKER_NOT_FOUND",
  "details": []
}
```

### 3.3 Error Code Registry

```
AUTH_001   Invalid credentials
AUTH_002   Token expired
AUTH_003   Unauthorized role
AUTH_004   OTP expired or invalid
USER_001   User not found
USER_002   Email already exists
USER_003   Phone already exists
WORKER_001 Worker not found
WORKER_002 Worker not verified
WORKER_003 Worker unavailable
BOOKING_001 Booking not found
BOOKING_002 Worker not available at that time
BOOKING_003 Cannot cancel after job started
PAYMENT_001 Payment failed
PAYMENT_002 Invalid signature
SEARCH_001 Location required for nearby search
VALIDATION  Request body validation failed
INTERNAL    Internal server error
```

### 3.4 Environment Variables

```env
# App
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/dailyrojgar
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Payment
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Storage
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-south-1
AWS_S3_BUCKET=dailyrojgar-uploads

# Email
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@dailyrojgar.in

# SMS
MSG91_AUTH_KEY=
MSG91_SENDER_ID=DROJGR
MSG91_TEMPLATE_ID=

# Monitoring
SENTRY_DSN=
```

---

## Phase 4 — Authentication & Security ⏳

**Goal:** Implement a production-grade auth system before any protected route is built.

### 4.1 Auth Flow

```
Registration Flow
─────────────────
POST /api/auth/register
  → Validate input (Zod)
  → Check email + phone uniqueness
  → Hash password (bcrypt, rounds: 12)
  → Save user
  → Send OTP to phone (MSG91)
  → Return { userId, message: "OTP sent" }

POST /api/auth/verify-otp
  → Validate OTP from Redis (TTL: 10min)
  → Mark user.isVerified = true
  → Generate accessToken (15m) + refreshToken (7d)
  → Store refreshToken in Redis: key = refresh:{userId}
  → Return tokens + user object

Login Flow
──────────
POST /api/auth/login
  → Validate credentials
  → Check isVerified, isActive
  → Compare password (bcrypt.compare)
  → Generate new token pair
  → Return tokens

Token Refresh Flow
──────────────────
POST /api/auth/refresh
  → Verify refreshToken signature
  → Check Redis: refresh:{userId} matches
  → Issue new accessToken
  → Rotate refreshToken (invalidate old, store new)

Logout Flow
───────────
POST /api/auth/logout
  → Delete refresh:{userId} from Redis
  → Blacklist current accessToken in Redis (TTL = remaining expiry)
  → Return 200
```

### 4.2 JWT Payload Shape

```typescript
interface JWTPayload {
  sub: string // userId
  role: 'customer' | 'worker' | 'admin'
  iat: number
  exp: number
}
```

### 4.3 Security Middleware Stack

Applied in this exact order on every request:

```
1. helmet()                        Security headers
2. cors(corsOptions)               Whitelist CLIENT_URL
3. express.json({ limit: '10kb' }) Body size limit
4. mongoSanitize()                 Prevent NoSQL injection
5. xss-clean                       Sanitise HTML in body
6. hpp()                           HTTP parameter pollution
7. generalRateLimiter              100 req/15min per IP
8. authRateLimiter                 10 req/15min on /auth/*
```

### 4.4 Role-Based Access Control

```typescript
// Usage in routes
router.get(
  '/admin/users',
  authenticate, // verifies JWT
  authorize('admin'), // checks role
  AdminController.listUsers,
)

router.get('/worker/jobs', authenticate, authorize('worker'), WorkerController.getMyJobs)
```

### 4.5 Password & OTP Security

- Passwords: **bcrypt**, cost factor 12
- OTP: 6-digit numeric, **crypto.randomInt** (not Math.random)
- OTP storage: Redis with TTL 600s (10 minutes)
- OTP attempt limit: 3 failed attempts → lock for 30 minutes
- Rate limit on `/auth/verify-otp`: 5 req/minute per IP

---

## Phase 5 — Domain APIs ⏳

**Goal:** Implement all business domain endpoints following the layered architecture.

### 5.1 Auth APIs

| Method | Endpoint                    | Role   | Description           |
| ------ | --------------------------- | ------ | --------------------- |
| POST   | `/api/auth/register`        | Public | Register new user     |
| POST   | `/api/auth/login`           | Public | Login                 |
| POST   | `/api/auth/logout`          | Auth   | Logout + revoke token |
| POST   | `/api/auth/refresh`         | Public | Refresh access token  |
| POST   | `/api/auth/verify-otp`      | Public | Verify phone OTP      |
| POST   | `/api/auth/resend-otp`      | Public | Resend OTP            |
| POST   | `/api/auth/forgot-password` | Public | Send reset link       |
| POST   | `/api/auth/reset-password`  | Public | Reset with token      |

### 5.2 Worker APIs

| Method | Endpoint                    | Role   | Description           |
| ------ | --------------------------- | ------ | --------------------- |
| GET    | `/api/workers`              | Public | List/search workers   |
| GET    | `/api/workers/:id`          | Public | Worker public profile |
| POST   | `/api/workers/profile`      | Worker | Create/update profile |
| PATCH  | `/api/workers/availability` | Worker | Toggle availability   |
| POST   | `/api/workers/documents`    | Worker | Upload documents      |
| GET    | `/api/workers/me/stats`     | Worker | My earnings + stats   |
| GET    | `/api/workers/me/jobs`      | Worker | My job history        |

### 5.3 Search APIs

| Method | Endpoint               | Role   | Description               |
| ------ | ---------------------- | ------ | ------------------------- |
| GET    | `/api/search/workers`  | Public | Full-text + geo + filter  |
| GET    | `/api/search/services` | Public | Search service categories |

**Search query parameters:**

```
q             keyword (worker skill, name)
lat           latitude (required for nearby)
lng           longitude (required for nearby)
radius        km, default 10
categoryId    filter by service category
minRating     e.g. 4
maxPrice      per day
availability  true/false
sortBy        rating | price | distance | reviews
page          default 1
limit         default 20, max 50
```

**Geo query implementation:**

```javascript
// MongoDB $geoNear aggregation pipeline
{
  $geoNear: {
    near: { type: 'Point', coordinates: [lng, lat] },
    distanceField: 'distance',
    maxDistance: radius * 1000,  // metres
    spherical: true
  }
}
```

### 5.4 Booking APIs

| Method | Endpoint                     | Role            | Description      |
| ------ | ---------------------------- | --------------- | ---------------- |
| POST   | `/api/bookings`              | Customer        | Create booking   |
| GET    | `/api/bookings`              | Customer/Worker | My bookings      |
| GET    | `/api/bookings/:id`          | Auth            | Booking detail   |
| PATCH  | `/api/bookings/:id/accept`   | Worker          | Accept booking   |
| PATCH  | `/api/bookings/:id/reject`   | Worker          | Reject booking   |
| PATCH  | `/api/bookings/:id/start`    | Worker          | Mark in-progress |
| PATCH  | `/api/bookings/:id/complete` | Worker          | Mark completed   |
| PATCH  | `/api/bookings/:id/cancel`   | Customer/Worker | Cancel           |
| POST   | `/api/bookings/:id/dispute`  | Customer        | Raise dispute    |

**Booking state machine:**

```
pending → accepted → in_progress → completed
        ↘ rejected
pending → cancelled  (before acceptance)
accepted → cancelled (by customer, before start)
completed → disputed (within 24h window)
```

### 5.5 Payment APIs

| Method | Endpoint                     | Role     | Description           |
| ------ | ---------------------------- | -------- | --------------------- |
| POST   | `/api/payments/create-order` | Customer | Create Razorpay order |
| POST   | `/api/payments/verify`       | Customer | Verify + capture      |
| POST   | `/api/payments/webhook`      | Public   | Razorpay webhook      |
| GET    | `/api/payments/:bookingId`   | Auth     | Payment details       |
| POST   | `/api/payments/:id/refund`   | Admin    | Initiate refund       |

### 5.6 Review APIs

| Method | Endpoint                        | Role     | Description      |
| ------ | ------------------------------- | -------- | ---------------- |
| POST   | `/api/reviews`                  | Customer | Submit review    |
| GET    | `/api/reviews/worker/:workerId` | Public   | Worker's reviews |
| POST   | `/api/reviews/:id/reply`        | Worker   | Reply to review  |
| DELETE | `/api/reviews/:id`              | Admin    | Remove review    |

### 5.7 Notification APIs

| Method | Endpoint                      | Role | Description      |
| ------ | ----------------------------- | ---- | ---------------- |
| GET    | `/api/notifications`          | Auth | My notifications |
| PATCH  | `/api/notifications/read-all` | Auth | Mark all read    |
| PATCH  | `/api/notifications/:id/read` | Auth | Mark one read    |

---

## Phase 6 — Realtime Layer ⏳

**Goal:** Implement Socket.io for chat and live notifications.

### 6.1 Socket Architecture

```
Server
├── /chat namespace
│   Events received:
│     join_chat       (chatId)
│     send_message    (chatId, text, type)
│     typing          (chatId)
│     stop_typing     (chatId)
│   Events emitted:
│     new_message     (message object)
│     user_typing     (userId)
│     message_read    (messageId)
│
└── /notifications namespace
    Events emitted:
      new_notification  (notification object)
      booking_update    (booking status)
      worker_nearby     (for customer tracking)
```

### 6.2 Socket Authentication

```typescript
// Middleware on socket connection
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token
  const payload = verifyToken(token)
  socket.data.userId = payload.sub
  socket.data.role = payload.role
  next()
})
```

### 6.3 Chat Flow

```
1. Booking created → Chat document auto-created
2. Customer connects → joins room: chat:{bookingId}
3. Worker connects → joins room: chat:{bookingId}
4. send_message event → save to DB → emit new_message to room
5. Unread count maintained in Redis: unread:{userId}:{chatId}
```

---

## Phase 7 — Frontend Architecture ✅

**Goal:** Scaffold the React + TypeScript application with all routing, state, and design system in place.

### 7.1 Folder Structure

```
apps/client/src/
├── app/
│   ├── router.tsx           # All routes defined here
│   ├── store.ts             # Zustand store root
│   └── queryClient.ts       # React Query config
│
├── features/                # Domain-driven feature modules
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── api.ts
│   ├── worker/
│   ├── customer/
│   ├── booking/
│   ├── payment/
│   ├── chat/
│   ├── search/
│   ├── review/
│   └── admin/
│
├── components/              # Shared/reusable UI components
│   ├── ui/                  # Primitives: Button, Input, Badge, Card
│   ├── layout/              # Navbar, Footer, Sidebar, PageWrapper
│   ├── feedback/            # Toast, Modal, Skeleton, EmptyState
│   └── forms/               # FormField, PhoneInput, DatePicker
│
├── hooks/                   # Shared hooks
│   ├── useAuth.ts
│   ├── useGeoLocation.ts
│   ├── useSocket.ts
│   ├── useDebounce.ts
│   └── useInfiniteScroll.ts
│
├── lib/
│   ├── axios.ts             # Axios instance + interceptors
│   ├── socket.ts            # Socket.io client init
│   └── utils.ts             # cn(), formatCurrency(), etc.
│
├── types/                   # TypeScript interfaces
│   ├── user.types.ts
│   ├── worker.types.ts
│   ├── booking.types.ts
│   └── api.types.ts
│
├── constants/
│   └── routes.ts            # Route path constants
│
└── assets/
    └── icons/
```

### 7.2 Routing Structure

```typescript
// Public routes
/                          Landing page
/services                  Service categories
/about                     About page
/login                     Login
/register                  Register
/workers/:id               Worker public profile

// Customer routes (protected, role: customer)
/customer/dashboard        Dashboard
/customer/search           Search workers
/customer/bookings         All bookings
/customer/bookings/:id     Booking detail
/customer/chat/:bookingId  Chat
/customer/payment/:bookingId  Payment
/customer/profile          Profile settings
/customer/reviews          My reviews given

// Worker routes (protected, role: worker)
/worker/dashboard          Dashboard
/worker/profile            Edit profile + skills
/worker/documents          Upload/manage documents
/worker/jobs               Incoming + history
/worker/jobs/:id           Job detail
/worker/earnings           Earnings + payout
/worker/availability       Set availability
/worker/chat/:bookingId    Chat

// Admin routes (protected, role: admin)
/admin/dashboard           Metrics overview
/admin/users               User management
/admin/workers             Worker verification queue
/admin/workers/:id         Worker detail + approve/reject
/admin/bookings            All bookings
/admin/payments            Transaction log
/admin/reports             Dispute management
```

### 7.3 Axios Configuration

```typescript
// Interceptors:
// Request → attach Authorization: Bearer <token>
// Response 401 → call /auth/refresh → retry original request (once)
// Response error → standardize error shape → throw
```

### 7.4 State Management

**Zustand stores:**

```typescript
authStore     { user, tokens, login(), logout(), refreshToken() }
uiStore       { theme, sidebarOpen, modals }
socketStore   { socket, connected, connect(), disconnect() }
locationStore { coords, loading, error, fetchLocation() }
```

**React Query usage:**

```typescript
// All server state via React Query — no manual fetch in components
useWorkers(filters) // GET /api/search/workers
useWorkerById(id) // GET /api/workers/:id
useMyBookings(status) // GET /api/bookings
useNotifications() // GET /api/notifications (polling or socket)
```

---

## Phase 8 — Frontend Pages & Flows ⏳

**Goal:** Build every page and user flow matching the product requirements.

### 8.1 Landing Page Components

```
<LandingPage>
  <Navbar />                Logo, nav links, Login/Register CTA
  <HeroSection />           Headline, search bar with location, CTAs
  <ServiceCategories />     Grid of 10 service cards
  <HowItWorks />            3-step customer flow + 3-step worker flow
  <TrustSection />          Stats: verified workers, secure pay, ratings
  <WorkerCTA />             "Earn with your skills — Join as Worker"
  <Footer />                Links, social, copyright
```

### 8.2 Search & Discovery Page

```
<SearchPage>
  <SearchFilters />
    ├── Location input (with auto-detect)
    ├── Service category dropdown
    ├── Price range slider
    ├── Min rating selector (1–5 stars)
    ├── Availability toggle
    └── Sort by (distance / rating / price)
  <WorkerGrid />
    └── <WorkerCard />   (avatar, name, skills, rating, price/day, distance)
  <MapView />            (optional toggle — show workers on map)
  <Pagination />
```

### 8.3 Worker Public Profile Page

```
<WorkerProfilePage>
  <ProfileHeader />       Photo, name, rating, distance, availability badge
  <SkillBadges />         List of verified skills
  <StatsSummary />        Completed jobs, years experience, response rate
  <ReviewList />          Paginated reviews from customers
  <BookingCTA />          "Book Now" sticky panel — date, time, note
```

### 8.4 Customer Booking Flow

```
Step 1: Select service category
Step 2: Set date, time, estimated hours
Step 3: Confirm location (map picker)
Step 4: Add notes (optional)
Step 5: Review pricing breakdown
Step 6: Choose payment method (online / cash)
Step 7: Confirm → POST /api/bookings
Step 8: If online → Payment page → Razorpay checkout
Step 9: Booking confirmed screen
```

### 8.5 Worker Dashboard

```
<WorkerDashboard>
  <EarningsSummary />     Today / This week / This month
  <AvailabilityToggle />  One-tap toggle for "Available Now"
  <IncomingJobsPanel />   Pending job requests with Accept/Reject
  <ActiveJobCard />       Current in-progress job
  <RecentActivity />      Last 5 completed jobs
  <RatingWidget />        Current rating + recent reviews
```

### 8.6 Customer Dashboard

```
<CustomerDashboard>
  <ActiveBooking />       Current ongoing booking + worker contact
  <UpcomingBookings />    Scheduled bookings timeline
  <QuickSearch />         Shortcut to search with last-used filters
  <RecentBookings />      History of past bookings
  <PendingReviews />      Bookings awaiting your review
```

### 8.7 Admin Dashboard

```
<AdminDashboard>
  <MetricsRow />          Users, Workers, Bookings today, Revenue
  <WorkerVerificationQueue />   Pending worker applications
  <RecentDisputes />      Open dispute cases
  <TransactionFeed />     Live payment log
  <Charts />              Weekly bookings, revenue, growth
```

### 8.8 UI Component Spec

Every component must handle all states:

| State   | Implementation                               |
| ------- | -------------------------------------------- |
| Loading | Skeleton screen (not spinner where possible) |
| Empty   | Illustration + helpful message + CTA         |
| Error   | Error message + retry button                 |
| Success | Confirmation UI or toast                     |

---

## Phase 9 — Payment System ⏳

**Goal:** Build a secure, production-ready payment integration with Razorpay.

### 9.1 Online Payment Flow

```
Customer clicks "Pay"
      ↓
POST /api/payments/create-order
  → Create Razorpay order (server-side)
  → Save payment record (status: created)
  → Return { orderId, amount, currency, key }
      ↓
Frontend loads Razorpay checkout modal
      ↓
Customer completes payment
      ↓
Razorpay returns { razorpay_order_id, razorpay_payment_id, razorpay_signature }
      ↓
POST /api/payments/verify
  → Verify HMAC signature (server-side)
  → If valid: update payment status → captured
  → Update booking.paymentStatus → paid
  → Emit notification to worker
  → Queue worker payout job
      ↓
Customer sees confirmation
```

### 9.2 Webhook Handling

```
POST /api/payments/webhook  (Razorpay calls this)
  → Validate X-Razorpay-Signature header
  → Handle events:
      payment.captured  → mark paid
      payment.failed    → mark failed, notify customer
      refund.created    → mark refund initiated
      refund.processed  → mark refunded, confirm to customer
```

### 9.3 Platform Fee Logic

```
totalAmount  = workerPricePerDay × estimatedHours ÷ 8
platformFee  = totalAmount × 0.10 (10%)
workerPayout = totalAmount - platformFee
```

### 9.4 Refund Policy

- **Before acceptance**: Full refund, instant
- **After acceptance, before start**: 90% refund
- **After start**: No refund (dispute process)

---

## Phase 10 — Notifications & Queues ⏳

**Goal:** Event-driven notification system that scales independently of the main API.

### 10.1 Queue Architecture (BullMQ + Redis)

```
Queues:
  email-queue         → email.job.ts processor
  sms-queue           → sms.job.ts processor
  notification-queue  → notification.job.ts (in-app)
  payout-queue        → payout.job.ts

Configuration:
  - Concurrency: 5 per queue
  - Retry: 3 attempts, exponential backoff
  - Failed jobs: retained 72h for inspection
```

### 10.2 Notification Events Map

| Event                       | In-App | Email | SMS |
| --------------------------- | ------ | ----- | --- |
| Booking created (worker)    | ✓      | ✓     | ✓   |
| Booking accepted (customer) | ✓      | ✓     | ✓   |
| Booking rejected (customer) | ✓      | —     | ✓   |
| Job started (customer)      | ✓      | —     | —   |
| Job completed (customer)    | ✓      | ✓     | —   |
| Payment received (worker)   | ✓      | ✓     | ✓   |
| Review received (worker)    | ✓      | —     | —   |
| Worker approved (worker)    | ✓      | ✓     | ✓   |
| Worker rejected (worker)    | ✓      | ✓     | ✓   |

### 10.3 Push Notification Architecture (Future-ready)

- Store FCM token on login
- Trigger via Firebase Admin SDK from notification job
- Graceful fallback to SMS if push fails

---

## Phase 11 — Admin System ⏳

**Goal:** Full-featured admin panel for platform operations.

### 11.1 Worker Verification Workflow

```
Worker submits documents
        ↓
System auto-checks: all required docs present?
        ↓ Yes
Admin queue: status = under_review
        ↓
Admin reviews: profile, Aadhaar, photo
        ↓
  Approve → worker.verificationStatus = approved
             → worker can receive jobs
             → email + SMS to worker
  Reject  → worker.verificationStatus = rejected
             → rejectionReason saved
             → worker notified with reason
             → can resubmit
```

### 11.2 Dispute Resolution Workflow

```
Customer raises dispute within 24h of completion
        ↓
Booking status → disputed
        ↓
Admin reviews: booking, chat history, notes
        ↓
  Resolve for customer → initiate refund
  Resolve for worker   → close dispute
  Partial resolution   → partial refund
        ↓
Both parties notified
```

### 11.3 Admin Metrics (Dashboard Queries)

```
Total users        db.users.countDocuments()
New today          createdAt >= startOfDay
Active workers     verificationStatus: approved, isAvailableNow: true
Bookings today     scheduledDate = today
Revenue today      SUM(payments.amount) where status=captured, today
Pending disputes   bookings.status = disputed
Pending verifications  workers.verificationStatus = under_review
```

---

## Phase 12 — AI Features ⏳

**Goal:** Future-ready AI layer — architecture defined now, activated progressively.

### 12.1 Smart Worker Matching

**Algorithm (v1 — rule-based, no ML required):**

```
score = (
  (1 / distance_km) × 0.30        // proximity weight
  + (rating / 5) × 0.35           // quality weight
  + (completedJobs / 100) × 0.20  // experience weight
  + (isAvailableNow ? 1 : 0) × 0.15  // availability weight
)
```

Sorted descending — top results shown first.

**v2 (ML pipeline — future phase):**

- Collect implicit feedback: click-through, booking, repeat booking
- Train collaborative filtering model
- Serve recommendations via dedicated microservice

### 12.2 Dynamic Price Recommendation

```
Factors:
  - Category baseline price (from service config)
  - Location demand multiplier (pincode-level)
  - Day-of-week + time-of-day factor
  - Supply/demand ratio (available workers in area)

Output: suggested price range shown to worker on profile setup
```

### 12.3 AI Assistant (future)

- Worker profile improvement suggestions (NLP analysis of bio)
- Skill gap detection based on local job demand
- Customer support bot (intent classification → FAQ / escalate)

---

## Phase 13 — Testing ⏳

**Goal:** Meaningful test coverage at every layer. No test theatre.

### 13.1 Test Strategy

| Layer             | Type        | Tool                           | Target Coverage         |
| ----------------- | ----------- | ------------------------------ | ----------------------- |
| Utility functions | Unit        | Jest                           | 100%                    |
| Service layer     | Unit        | Jest + mocks                   | 80%+                    |
| API endpoints     | Integration | Supertest + test DB            | All happy + error paths |
| Auth flows        | Integration | Supertest                      | All flows               |
| Payment flows     | Integration | Supertest + Razorpay test keys | All flows               |
| React components  | Component   | React Testing Library          | Key UI states           |
| User flows        | E2E         | Playwright (future)            | Critical paths          |

### 13.2 Test Structure

```
apps/server/
  src/__tests__/
    unit/
      auth.service.test.ts
      booking.service.test.ts
      search.service.test.ts
    integration/
      auth.routes.test.ts
      worker.routes.test.ts
      booking.routes.test.ts
      payment.routes.test.ts

apps/client/
  src/__tests__/
    components/
      WorkerCard.test.tsx
      BookingForm.test.tsx
      SearchFilters.test.tsx
    pages/
      SearchPage.test.tsx
```

### 13.3 Test Database Strategy

- Separate MongoDB instance for tests: `dailyrojgar_test`
- `beforeAll`: connect, seed required data
- `afterEach`: clear modified collections
- `afterAll`: drop DB, disconnect

---

## Phase 14 — DevOps & Deployment ✅

**Goal:** Containerized, reproducible deployment with automated CI/CD.

### 14.1 Docker Setup

**docker-compose.yml (local development)**

```yaml
services:
  client:
    build: ./apps/client
    ports: ['3000:3000']
    volumes: ['./apps/client:/app']

  server:
    build: ./apps/server
    ports: ['5000:5000']
    environment:
      - MONGODB_URI=mongodb://mongo:27017/dailyrojgar
      - REDIS_URL=redis://redis:6379
    depends_on: [mongo, redis]
    volumes: ['./apps/server:/app']

  mongo:
    image: mongo:7
    ports: ['27017:27017']
    volumes: ['mongo_data:/data/db']

  redis:
    image: redis:7-alpine
    ports: ['6379:6379']
    volumes: ['redis_data:/data']

  mongo-express: # DB admin UI (dev only)
    image: mongo-express
    ports: ['8081:8081']
    depends_on: [mongo]

volumes:
  mongo_data:
  redis_data:
```

### 14.2 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
on: [push, pull_request]

jobs:
  lint: Prettier + TypeScript check (both apps)
  test: Jest + Supertest (server) + RTL (client)
  build: Vite build (client) + tsc build (server)
  docker: Build Docker images + push to registry
  deploy: Deploy to staging on develop branch push
    Deploy to production on main branch push
```

### 14.3 Infrastructure (Production)

```
Domain: dailyrojgar.in

CDN / Static hosting: Vercel / Cloudflare Pages  (React app)
API Server:          AWS EC2 or Railway           (Express)
Database:            MongoDB Atlas (M10+)
Cache:               Redis Cloud or Upstash
File Storage:        AWS S3 + CloudFront
Email:               AWS SES
SMS:                 MSG91
Monitoring:          Sentry (errors) + Datadog (metrics)
```

---

## Phase 15 — Monitoring & Observability ⏳

**Goal:** Full visibility into system health in production.

### 15.1 Structured Logging (Winston)

```typescript
// Every log entry:
{
  timestamp: ISO8601,
  level: 'error' | 'warn' | 'info' | 'debug',
  service: 'api',
  requestId: uuid,       // injected per request via middleware
  userId: string | null,
  message: string,
  meta: { ... }          // additional context
}
```

### 15.2 HTTP Request Logging

- Tool: Morgan middleware with Winston stream
- Log: method, path, status, response time, IP
- Exclude: health check endpoint

### 15.3 Error Tracking

- Tool: Sentry
- Capture: all unhandled errors + promise rejections
- Include: user context, request details, stack trace
- Alert: Slack notification on new error type

### 15.4 Performance Metrics

- Response time p50 / p95 / p99 per route
- MongoDB query time (Mongoose plugin)
- Redis cache hit rate
- Queue job processing time
- Worker payout latency

### 15.5 Health Check Endpoint

```
GET /api/health
Response:
{
  "status": "ok",
  "uptime": 3600,
  "database": "connected",
  "redis": "connected",
  "queues": { "email": "active", "sms": "active" },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

## Appendix — API Contract

### Base URL

```
Development:  http://localhost:5000/api
Production:   https://api.dailyrojgar.in/api
```

### Authentication Header

```
Authorization: Bearer <access_token>
```

### Pagination Parameters

```
page    integer   default: 1
limit   integer   default: 20, max: 50
```

### Common Response Headers

```
X-Request-ID      Unique request identifier
X-Response-Time   Processing time in ms
```

---

## Appendix — Folder Structure

```
dailyRojgar/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── apps/
│   ├── client/                  React + TypeScript + Vite
│   │   ├── src/
│   │   ├── public/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   └── tsconfig.json
│   │
│   └── server/                  Node + Express + TypeScript
│       ├── src/
│       │   ├── config/
│       │   ├── models/
│       │   ├── repositories/
│       │   ├── services/
│       │   ├── controllers/
│       │   ├── routes/
│       │   ├── middleware/
│       │   ├── validators/
│       │   ├── queues/
│       │   ├── jobs/
│       │   ├── sockets/
│       │   ├── utils/
│       │   ├── app.ts
│       │   └── server.ts
│       ├── tests/
│       └── tsconfig.json
│
├── packages/
│   ├── shared-types/            Shared TS types (User, Booking, etc.)
│   └── shared-utils/            Pure helpers used by both apps
│
├── docker/
│   ├── client.Dockerfile
│   └── server.Dockerfile
│
├── docs/
│   ├── api.md                   Full API reference
│   ├── architecture.md          Architecture diagrams
│   └── deployment.md            Deployment runbook
│
├── .env.example
├── .gitignore
├── .nvmrc
├── docker-compose.yml
├── package.json                 Workspace root
└── workflow.md                  ← this file
```

---

## Implementation Order (Quick Reference)

```
Phase 0   Foundation & Tooling            ~1 day
Phase 1   System Design                   ~1 day
Phase 2   Database Design                 ~1 day
Phase 3   Backend Core (scaffold)         ~2 days
Phase 4   Auth & Security                 ~2 days
Phase 5   Domain APIs                     ~5 days
Phase 6   Realtime Layer                  ~2 days
Phase 7   Frontend Architecture           ~2 days
Phase 8   Frontend Pages & Flows          ~6 days
Phase 9   Payment System                  ~2 days
Phase 10  Notifications & Queues          ~2 days
Phase 11  Admin System                    ~2 days
Phase 12  AI Features                     ~3 days
Phase 13  Testing                         ~3 days
Phase 14  DevOps & Deployment             ~2 days
Phase 15  Monitoring & Observability      ~1 day
──────────────────────────────────────────────────
          Total estimate                  ~37 days
```

---

_Ready to start Phase 0. Say "start Phase N" to begin implementation of any phase._
