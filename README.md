# Mentor Invoice Dashboard — Zen Portal Feature

Automated mentor attendance tracking, session duration aggregation, and invoice generation system for the Zen Portal, replacing manual Google Sheets with a unified, rule-compliant architecture.

Built in strict compliance with [HACKATHON_RULES.md](file:///c:/Mentor%20Invoice/HACKATHON_RULES.md).

---

## 1. Feature Overview

Operations teams previously managed mentor payouts through individual manual spreadsheets (e.g. *15th August 2026 - 14th September 2026_Mentor Invoice sheet* for Mr. Shabarinath P and dozens of separate mentor tabs), manually copying session dates, calculating rounded hours, looking up combined batch codes, and formatting bank accounts for the accounts team.

This feature automates the entire pipeline:
1. **Live Ingestion from Zen Collections**: Matches `hostAttendance` records with `sessions`, `batches`, and `courses`.
2. **Precision Rounding & Deduplication**:
   - Computes billable duration using peer duration in seconds, rounded to 1 decimal place matching Excel formulas (`math.Round(val*10)/10`).
   - Automatically detects combined classes (`isCombineClass: true` / shared timestamps) and populates the secondary batches into the **Comments** column (e.g., `DSGA-S-WE-T-B22, B21, B23`), preventing duplicate billing.
3. **Unified Mentor Console**: Brings all mentors into a single dashboard with search, totals, and one-click inspection.
4. **Dynamic Mentor Profiles**: Configurable hourly compensation rate (e.g., ₹3,000/hr) and bank credentials (Account No, IFSC, PAN) stored in MongoDB (`mentorProfiles`), eliminating hardcoded data.
5. **Ready-to-Share Accounts Handover**: One-click CSV/Excel export formatted identically to the Google Sheet format for verification and payment processing.

---

## 2. Technical Stack

| Layer | Technology | Adherence Notes |
|---|---|---|
| **Backend** | Go 1.25+, Gin router, official `mongo-driver v1`, `go-redis/v9` | Located exclusively in `mentor-invoice/` |
| **Frontend** | React 18, Plain JavaScript, MUI v5, Redux Toolkit | Located exclusively in `src/mentor-invoice/` |
| **Caching** | Redis 7 key-value store with TTL & automatic invalidation | `mentor_invoice:summary:<program>`, `mentor_invoice:profiles:<program>` |
| **Worker Queue** | Redis BLPop named job consumer queue (Rule 6) | `mentor_invoice:batch_generate`, `mentor_invoice:monthly_billing_cycle` |
| **Tenancy** | `program: "zen"` (and other BU keys) | Enforced on **every** MongoDB query with `deleted: false` |
| **Auth** | Token in `Authorization: <token>` (no `Bearer`) | Read via context `c.MustGet("auth")` and `c.MustGet("program")` |
| **Permissions** | `mentor-invoice.view` and `mentor-invoice.edit` | Enforced on every route |

---

## 3. Directory Structure

```
mentor-invoice/                   <-- Backend isolated folder
├── models/
│   ├── constants.go              # Collection names, permissions, status
│   ├── invoice.go                # Invoice, InvoiceItem, Summary, MentorListItem
│   ├── profile.go                # MentorProfile & BankDetails
│   └── zen_models.go             # Zen read-only structs (HostAttendance, Batch, Course, Session)
├── core/
│   ├── calculator.go             # Pure logic: duration rounding, hour summation, rate application
│   ├── aggregator.go             # Combined batch deduplication & line item aggregation
│   └── calculator_test.go        # Unit tests
├── store/
│   ├── store.go                  # Store interface
│   ├── mongo_store.go            # MongoDB driver implementation (program + deleted: false enforced)
│   └── fake_store.go             # In-memory store for zero-database test runs
├── controllers/
│   ├── handlers.go               # Gin controller handlers
│   └── handlers_test.go          # HTTP handler tests using FakeStore
├── routes/
│   └── routes.go                 # routes.Register(engine, store)
├── worker/
│   └── worker.go                 # Redis worker registration
├── scripts/
│   ├── indexes.js                # Idempotent MongoDB index script
│   └── seed.js                   # Synthetic test fixtures mirroring Google Sheet
├── go.mod                        # Go module
├── API_SPEC.md                   # Full OpenAPI / Markdown API table
└── main.go                       # Standalone dev server

src/mentor-invoice/               <-- Frontend isolated folder
├── components/
│   ├── MentorSummaryCard.jsx     # Top block replica with bank details & totals
│   ├── SheetTable.jsx            # Attendance table replica with sticky headers
│   ├── StatCard.jsx              # Zen KPI cards
│   └── StatusBadge.jsx           # Review lifecycle chip
├── pages/
│   ├── DashboardPage.jsx         # Unified hub for all mentors
│   ├── InvoiceSheetView.jsx      # Detailed Google Sheet view for a mentor
│   └── MentorRatesPage.jsx       # Hourly rates & bank accounts management
├── apiCalls/
│   └── mentorInvoiceApi.js       # Centralized API helper with Redux token injection
├── utils/
│   ├── formatters.js             # Currency (₹), hours, and date/time formatters
│   └── exportHelpers.js          # Google Sheet-identical CSV/Excel exporter
├── styles/
│   └── mentorInvoice.css         # Zen tokens (Primary #0d75fc, Wanted Sans font)
├── routes.js                     # Lazy routes with permission tags
└── navItems.js                   # Zen sidebar navigation items
```

---

## 4. Setup & Running Instructions

### 4.1 Running the Backend (Go)

```bash
# 1. Navigate to the backend folder
cd mentor-invoice

# 2. Run unit & controller tests (runs without database using fake_store)
go test -v ./...

# 3. Run standalone server (runs on port 8080)
# Optional: Set MONGO_URI to connect to MongoDB, or leave empty for mock mode
go run main.go
```

### 4.2 Running the Frontend (React / Vite)

```bash
# 1. Install dependencies
npm install

# 2. Start the local development server (runs on port 3000)
npm run dev
```

---

## 5. API Endpoints & Permissions

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| `GET` | `/mentor-invoice/summary` | `mentor-invoice.view` | Dashboard KPI cards |
| `GET` | `/mentor-invoice/mentors` | `mentor-invoice.view` | Active mentors with calculated hours & totals |
| `GET` | `/mentor-invoice/preview` | `mentor-invoice.view` | Live calculated invoice with session rows |
| `POST` | `/mentor-invoice/generate` | `mentor-invoice.edit` | Finalize & save billing cycle invoice |
| `GET` | `/mentor-invoice/list` | `mentor-invoice.view` | List generated invoices |
| `GET` | `/mentor-invoice/:id` | `mentor-invoice.view` | Fetch single invoice details |
| `PATCH` | `/mentor-invoice/:id/status` | `mentor-invoice.edit` | Transition invoice review status |
| `GET` | `/mentor-invoice/profiles` | `mentor-invoice.view` | List mentor hourly rates and bank profiles |
| `POST` | `/mentor-invoice/profiles` | `mentor-invoice.edit` | Add or update mentor rates and bank accounts |

---

## 6. Collections & Index Script

### Collections
1. **`mentorProfiles`**:
   - `id` (UUID), `program` (tenant), `mentorHash`, `mentorName`, `email`, `courseName`, `hourlyRate`, `currency`, `bankDetails: { accountNumber, ifsc, bankName, panNumber }`, `created: { at, by }`, `deleted: bool`.
2. **`mentorInvoices`**:
   - `id` (UUID), `program` (tenant), `invoiceNumber`, `mentorHash`, `mentorName`, `email`, `courseName`, `billingPeriodStart`, `billingPeriodEnd`, `billingPeriodLabel`, `hourlyRate`, `totalHours`, `totalSessions`, `totalAmount`, `bankDetails`, `status`, `items: [...]`, `created: { at, by }`, `deleted: bool`.

### Running Index & Seed Scripts
```bash
# In MongoDB shell / mongosh:
load("mentor-invoice/scripts/indexes.js")
load("mentor-invoice/scripts/seed.js")
```

---

## 7. Handover Checklist Status

- [x] Repo structure strictly follows Rule 2 (Backend in `mentor-invoice/`, Frontend in `src/mentor-invoice/`)
- [x] README with setup instructions, env vars, and architecture
- [x] API list with permissions (`mentor-invoice.view`, `mentor-invoice.edit`)
- [x] Database rules enforced (`program` filter and `deleted: false` on every query, string UUIDs, Unix timestamps)
- [x] No changes required outside our folder
- [x] Safe idempotent index script (`scripts/indexes.js`)
- [x] Seed script with synthetic realistic fixtures (`scripts/seed.js`)
- [x] Unit tests & handler tests with fake store passing 100%
