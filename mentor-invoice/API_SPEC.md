# Mentor Invoice API Specification

Every route sits under `/mentor-invoice/...` and adheres strictly to **HACKATHON_RULES.md**:
* **Standard Response Shape**:
  * Success: `{"status":"success","data": ...}`
  * Error: `{"status":"error","message":"..."}`
* **JSON casing**: `camelCase` for all keys.
* **Authentication**: Header `Authorization: <token>` (no `Bearer` prefix). Mock auth injects `auth` (user hash) and `program` (tenant key).
* **Permissions**: Every route declares its permission (`mentor-invoice.view` or `mentor-invoice.edit`).

---

## Endpoint List

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| `GET` | `/mentor-invoice/summary` | `mentor-invoice.view` | Returns dashboard high-level KPI cards: total invoiced amount, total hours, session count, active mentors, pending review counts. |
| `GET` | `/mentor-invoice/mentors` | `mentor-invoice.view` | Returns all active mentors for a program with summary hours, session counts, and payout estimates for the selected period. Optional query params: `?start=<unix>&end=<unix>`. |
| `GET` | `/mentor-invoice/preview` | `mentor-invoice.view` | Computes live invoice lines on-the-fly from `hostAttendance`, `sessions`, `batches`, and `courses` for a specific `mentorHash` and date range (`start`, `end`). |
| `POST` | `/mentor-invoice/generate` | `mentor-invoice.edit` | Finalizes and persists an invoice snapshot for a mentor and date range. Request body: `{"mentorHash": "...", "billingStart": 1786876800, "billingEnd": 1789555200}`. |
| `GET` | `/mentor-invoice/list` | `mentor-invoice.view` | Lists all previously generated invoices for the active tenant program. |
| `GET` | `/mentor-invoice/:id` | `mentor-invoice.view` | Fetches full invoice details by UUID, including all session row items and bank details. |
| `PATCH` | `/mentor-invoice/:id/status` | `mentor-invoice.edit` | Updates the status of an invoice (`draft`, `submitted`, `approved`, `paid`). Request body: `{"status": "approved"}`. |
| `GET` | `/mentor-invoice/profiles` | `mentor-invoice.view` | Lists all configured mentor billing profiles (hourly rates and bank credentials) for the tenant. |
| `POST` | `/mentor-invoice/profiles` | `mentor-invoice.edit` | Creates or updates a mentor's hourly rate (₹/hr) and bank credentials (Account No, IFSC, PAN). |

---

## Detailed Request & Response Schemas

### 1. `GET /mentor-invoice/summary`
**Permission**: `mentor-invoice.view`

**Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "totalInvoicedAmount": 133800.0,
    "totalHoursBilled": 44.6,
    "totalSessionsCount": 21,
    "activeMentorsCount": 1,
    "pendingReviewCount": 0,
    "approvedCount": 1
  }
}
```

---

### 2. `GET /mentor-invoice/preview?mentorHash=5f0a1501...&start=1786876800&end=1789555200`
**Permission**: `mentor-invoice.view`

**Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "mentorHash": "5f0a150188351bf13b2721fa2ca3de341a161b1f75b7f986a42f0cdd85e14e19cf4765c41b3e98242d9fe025ac95aa582c0abfc577ee3f0224719f753bd69728",
    "mentorName": "Mr. Shabarinath P",
    "email": "shabarinath.p@guvi.in",
    "courseName": "Program / INTEL AIML Intel & IITM Pravartak Certified Artificial Intelligence & Data Science",
    "billingPeriodStart": 1786876800,
    "billingPeriodEnd": 1789555200,
    "billingPeriodLabel": "16-Aug-2026 - 15-Sep-2026",
    "hourlyRate": 3000.0,
    "totalHours": 44.6,
    "totalSessions": 21,
    "totalAmount": 133800.0,
    "bankDetails": {
      "accountNumber": "18521810013970",
      "ifsc": "HDFC0001852",
      "bankName": "HDFC Bank",
      "panNumber": "CQAPS9106P"
    },
    "status": "draft",
    "items": [
      {
        "sessionId": "sess-shabari-1",
        "date": "8/16/2026",
        "sessionTimestamp": 1786876800,
        "courseName": "Zen_Data_Science",
        "batchCode": "DSGA-S-WE-T-B24",
        "interview": "Live Class",
        "hours": 2.3,
        "hostStatus": "Done",
        "comments": "DSGA-S-WE-T-B22",
        "scheduledDate": "16-Aug-2026",
        "scheduledStartTime": "16:00:00",
        "scheduledEndTime": "18:18:00",
        "actualJoinedTime": "16:00:12",
        "actualLeftTime": "18:18:33",
        "peerDurationSeconds": 8280,
        "attendancePercentage": 96
      }
    ]
  }
}
```

---

### 3. `POST /mentor-invoice/profiles`
**Permission**: `mentor-invoice.edit`

**Request Body**:
```json
{
  "mentorHash": "5f0a150188351bf13...",
  "mentorName": "Mr. Shabarinath P",
  "email": "shabarinath.p@guvi.in",
  "courseName": "Program / INTEL AIML Intel & IITM Pravartak Certified Artificial Intelligence & Data Science",
  "hourlyRate": 3000,
  "currency": "INR",
  "bankDetails": {
    "accountNumber": "18521810013970",
    "ifsc": "HDFC0001852",
    "bankName": "HDFC Bank",
    "panNumber": "CQAPS9106P"
  }
}
```

**Response (200 OK)**:
```json
{
  "status": "success",
  "data": { ... }
}
```
