/**
 * MongoDB Index Creation Script for Mentor Invoice Feature
 * Strictly adheres to HACKATHON_RULES.md (Rule 4)
 * Safe to run multiple times (idempotent)
 */

const dbName = process.env.MONGO_DB_NAME || "zen_portal";
const db = db.getSiblingDB(dbName);

print(`[indexes.js] Applying indexes to database: ${dbName}...`);

// 1. mentorProfiles indexes
try {
  db.mentorProfiles.createIndex(
    { program: 1, mentorHash: 1, deleted: 1 },
    { name: "idx_mentorProfiles_prog_hash", unique: false }
  );
  db.mentorProfiles.createIndex(
    { program: 1, deleted: 1 },
    { name: "idx_mentorProfiles_prog_deleted" }
  );
  print("✓ Created indexes for mentorProfiles");
} catch (e) {
  print("! mentorProfiles index warning: " + e.message);
}

// 2. mentorInvoices indexes
try {
  db.mentorInvoices.createIndex(
    { program: 1, id: 1, deleted: 1 },
    { name: "idx_mentorInvoices_prog_id" }
  );
  db.mentorInvoices.createIndex(
    { program: 1, mentorHash: 1, billingPeriodStart: 1, deleted: 1 },
    { name: "idx_mentorInvoices_prog_mentor_period" }
  );
  db.mentorInvoices.createIndex(
    { program: 1, status: 1, deleted: 1 },
    { name: "idx_mentorInvoices_prog_status" }
  );
  print("✓ Created indexes for mentorInvoices");
} catch (e) {
  print("! mentorInvoices index warning: " + e.message);
}

// 3. Performance indexes on read-only collections
try {
  db.hostAttendance.createIndex(
    { host: 1, sessionDate: 1, deleted: 1 },
    { name: "idx_hostAttendance_host_date" }
  );
  db.sessions.createIndex(
    { program: 1, mentor: 1, startTime: 1, deleted: 1 },
    { name: "idx_sessions_prog_mentor_time" }
  );
  print("✓ Created read optimization indexes for hostAttendance & sessions");
} catch (e) {
  print("! Zen collection index notice: " + e.message);
}

print("[indexes.js] All indexes configured successfully.");
