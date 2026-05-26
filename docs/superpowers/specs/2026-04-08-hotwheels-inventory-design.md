# Hot Wheels Bin Organizer — MVP Design Spec

> **Superseded for product direction:** The active mission is documented in `2026-05-25-product-vision.md` (ophthalmic procedure supply tracking in clinical operations). The technical stack and data model below remain valid; replace consumer/collector framing with clinical supply bins and facility locations.

## Context (original MVP)

A collector has a disorganized Hot Wheels collection stored across multiple physical boxes in different locations (storage unit, garage, house). The problem: no way to know what's in a box or where a box is without opening it. The solution is a private, multi-user web application where users create bins, add items to them, generate QR code labels to print and stick on physical boxes, and scan those QR codes to instantly see bin contents. Search lets users find any item and know exactly which bin and location it's in.

---

## Stack

| Layer | Choice |
|-------|--------|
| Frontend | React + Vite + TypeScript |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | Better Auth (email/password, admin plugin, DB sessions) |
| Routing | React Router v7 (`react-router` — not `react-router-dom`) |
| QR Generate | `qrcode` (client-side) |
| QR Scan | `html5-qrcode` (browser camera API) |

---

## Project Structure

```
strawhats/
├── client/                    # React + Vite + TypeScript
│   ├── src/
│   │   ├── pages/             # Login, Register, Dashboard, BinDetail, Label, Search, Admin
│   │   ├── components/        # BinCard, ItemList, QRCode, SearchBar, PrintLabel
│   │   ├── hooks/             # useSession (from better-auth/react)
│   │   └── lib/
│   │       ├── auth-client.ts # createAuthClient() + adminClient plugin
│   │       └── api.ts         # fetch wrapper for /api/* calls
│
├── server/                    # Node + Express + TypeScript
│   ├── src/
│   │   ├── lib/
│   │   │   └── auth.ts        # Better Auth config (prismaAdapter, admin plugin, DB sessions)
│   │   ├── routes/
│   │   │   ├── bins.ts
│   │   │   ├── items.ts
│   │   │   └── search.ts
│   │   ├── middleware/
│   │   │   └── requireAuth.ts # validates session, attaches user to req
│   │   ├── db/
│   │   │   └── prisma.ts      # PrismaClient singleton
│   │   └── index.ts           # Express app entry
│   └── prisma/
│       └── schema.prisma      # Bins + Items + Better Auth generated models
│
└── shared/
    └── types.ts               # Bin, Item, User interfaces shared by client + server
```

---

## Data Model

Better Auth owns the `User`, `Session`, and `Account` models (generated via CLI). Our models:

```prisma
model Bin {
  id          String   @id @default(uuid())
  userId      String
  name        String
  location    String   // free text: "Storage Unit", "Garage", "House"
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  items       Item[]
}

model Item {
  id          String   @id @default(uuid())
  binId       String
  bin         Bin      @relation(fields: [binId], references: [id], onDelete: Cascade)
  name        String
  description String?
  createdAt   DateTime @default(now())
}
```

- `location` is a free-text field on Bin — updated when the box moves
- Cascade delete: removing a bin removes all its items
- Better Auth `user.id` is referenced by `Bin.userId` (no explicit FK — Better Auth manages its own table)

---

## Auth (Better Auth)

- **Method:** Email & password only (MVP)
- **Plugin:** `admin` from `better-auth/plugins` — admin role can manage all users and data
- **Sessions:** Database-persisted (PostgreSQL via Prisma adapter). No JWT, no cookie cache, no secondary storage.
- **Adapter:** `prismaAdapter(prisma, { provider: "postgresql" })` from `better-auth/adapters/prisma`
- **Server file:** `server/src/lib/auth.ts`
- **Client file:** `client/src/lib/auth-client.ts` using `better-auth/react`
- **Express handler:** `app.all("/api/auth/*", toNodeHandler(auth))`
- **Migration:** `npx @better-auth/cli@latest generate --output prisma/schema.prisma` → `npx prisma migrate dev`

**Roles:**
- `admin` — full access, user management at `/admin/users`
- `user` — scoped to their own bins/items only

**Environment variables:**
```
BETTER_AUTH_SECRET=<openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://...
```

---

## API Routes

```
# Auth (Better Auth handles internally)
POST /api/auth/sign-up
POST /api/auth/sign-in
POST /api/auth/sign-out

# Bins (all require auth)
GET    /api/bins              list user's bins (supports ?location= filter)
POST   /api/bins              create bin
GET    /api/bins/:id          get bin + items
PUT    /api/bins/:id          update bin (name, location, description)
DELETE /api/bins/:id          delete bin + cascade items

# Items (all require auth)
POST   /api/bins/:id/items    add item to bin
PUT    /api/items/:id         update item
DELETE /api/items/:id         delete item

# Search (requires auth)
GET    /api/search?q=...      search items by name → returns item + bin name + location

# Label (requires auth)
GET    /api/bins/:id/label    returns bin data for QR label generation
```

All `/api/*` routes except `/api/auth/*` pass through `requireAuth` middleware.

---

## UI Pages

| Route | Description |
|-------|-------------|
| `/login` | Email + password sign in |
| `/register` | Sign up |
| `/dashboard` | All bins — grid view, search bar, filter by location |
| `/bins/new` | Create a bin |
| `/bins/:id` | Bin detail — item list, QR code display, edit location |
| `/bins/:id/edit` | Edit bin name/location/description |
| `/bins/:id/label` | Print-ready QR label (browser print) |
| `/search?q=` | Search results — item, bin, location |
| `/admin/users` | Admin only — user management |

**Auth flow:** Unauthenticated users hitting any protected route are redirected to `/login?redirect=<original-path>`. After login, they land on the originally requested page (e.g., scanned QR → `/bins/:id`).

---

## QR Code

- QR encodes a URL: `https://<app-domain>/bins/:id`
- Generated client-side using the `qrcode` library on the `/bins/:id` page
- Print label (`/bins/:id/label`) renders: QR code + bin name + location + item count
- User triggers browser print (`window.print()`) — works with any printer including thermal
- Scanning with phone camera opens the URL → redirects to login if no session → lands on bin

---

## Search

- Query hits `GET /api/search?q=<term>`
- Server queries `Item.name` with a `LIKE %term%` (or `ilike` in Postgres) across all bins owned by the authenticated user
- Response includes: item name, description, parent bin name, bin location
- Frontend displays results as a list with a "Go to Bin" link

---

## Verification Plan

1. **Auth:** Sign up a new user → sign in → verify session persists in DB → sign out → verify session removed
2. **Bins CRUD:** Create bin → add items → update bin location → delete bin → verify items cascade deleted
3. **QR flow:** Navigate to `/bins/:id/label` → print label → scan QR with phone → confirm redirect to login → login → confirm landing on correct bin
4. **Search:** Add items across multiple bins → search by item name → confirm correct bin + location returned
5. **Admin:** Sign in as admin → access `/admin/users` → confirm regular user cannot access that route
6. **Auth gate:** Sign out → attempt to navigate to `/dashboard` → confirm redirect to `/login`

---

## Out of Scope (MVP)

- Barcode / UPC scanning for item entry
- AI item identification or box summarization
- Photo attachments on items
- Email verification
- Password reset flow
- Mobile app / PWA packaging
- Nested bin locations (shelves, units within locations)
