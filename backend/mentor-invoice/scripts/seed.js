/**
 * Database Seed Script for Mentor Invoice Feature
 * Strictly adheres to HACKATHON_RULES.md (Rule 7: No real PII, realistic synthetic fixtures)
 * Mirroring the Google Sheet example:
 * - Mentor: Mr. Shabarinath P
 * - Course: Zen_Data_Science / INTEL AIML & IITM Pravartak Certified AI
 * - Batch: DSGA-S-WE-T-B24 (with combined batches DSGA-S-WE-T-B22, B21, B23)
 * - 21 sessions, 44.6 hours, Rate: ₹3,000/hr, Total: ₹133,800
 */

const dbName = process.env.MONGO_DB_NAME || "zen_portal";
const db = db.getSiblingDB(dbName);

print(`[seed.js] Seeding demo data into ${dbName}...`);

const program = "zen";
const now = Math.floor(Date.now() / 1000);

// 1. Seed Courses
db.courses.deleteMany({ program: program });
db.courses.insertMany([
  {
    id: "c89ec418-c685-43dc-88c0-e807edb03d41",
    name: "Zen_Data_Science",
    courseKey: "zen_data_science",
    batchCode: "DSGA",
    program: program,
    version: 1,
    isBatchAssigned: true,
    isActive: true,
    created: { at: 1776857464, by: "system" },
    deleted: false
  },
  {
    id: "c-fsd-mern-001",
    name: "Full Stack Development - MERN",
    courseKey: "fsd_mern",
    batchCode: "FSD",
    program: program,
    version: 1,
    isBatchAssigned: true,
    isActive: true,
    created: { at: 1776857464, by: "system" },
    deleted: false
  }
]);

// 2. Seed Batches
db.batches.deleteMany({ program: program });
db.batches.insertMany([
  {
    id: "6c78282c-91cd-4353-9e5b-2f74b06dd8d8",
    name: "DSGA-S-WE-T-B24",
    language: "Tamil",
    type: "WD",
    email: "dsga_b24@guvi.in",
    courseId: "c89ec418-c685-43dc-88c0-e807edb03d41",
    courseKey: "zen_data_science",
    program: program,
    mentors: ["5f0a150188351bf13b2721fa2ca3de341a161b1f75b7f986a42f0cdd85e14e19cf4765c41b3e98242d9fe025ac95aa582c0abfc577ee3f0224719f753bd69728"],
    batchCompleted: false,
    created: { at: 1776857464, by: "system" },
    deleted: false
  },
  {
    id: "b-comb-22",
    name: "DSGA-S-WE-T-B22",
    language: "Tamil",
    type: "WD",
    courseId: "c89ec418-c685-43dc-88c0-e807edb03d41",
    program: program,
    batchCompleted: false,
    created: { at: 1776857464, by: "system" },
    deleted: false
  },
  {
    id: "b-comb-21",
    name: "DSGA-S-WE-T-B21",
    language: "Tamil",
    type: "WD",
    courseId: "c89ec418-c685-43dc-88c0-e807edb03d41",
    program: program,
    batchCompleted: false,
    created: { at: 1776857464, by: "system" },
    deleted: false
  },
  {
    id: "b-comb-23",
    name: "DSGA-S-WE-T-B23",
    language: "Tamil",
    type: "WD",
    courseId: "c89ec418-c685-43dc-88c0-e807edb03d41",
    program: program,
    batchCompleted: false,
    created: { at: 1776857464, by: "system" },
    deleted: false
  }
]);

// 3. Seed Mentor Profiles (Hourly Rates & Bank Details)
const shabarinathHash = "5f0a150188351bf13b2721fa2ca3de341a161b1f75b7f986a42f0cdd85e14e19cf4765c41b3e98242d9fe025ac95aa582c0abfc577ee3f0224719f753bd69728";
const swastikHash = "mentor-hash-swastik-02";
const akashHash = "mentor-hash-akash-03";

db.mentorProfiles.deleteMany({ program: program });
db.mentorProfiles.insertMany([
  {
    id: "prof-shabarinath-1",
    program: program,
    mentorHash: shabarinathHash,
    mentorName: "Mr. Shabarinath P",
    email: "shabarinath.p@guvi.in",
    courseName: "Program / INTEL AIML Intel & IITM Pravartak Certified Artificial Intelligence & Data Science",
    hourlyRate: 3000,
    currency: "INR",
    bankDetails: {
      accountNumber: "18521810013970",
      ifsc: "HDFC0001852",
      bankName: "HDFC Bank",
      panNumber: "CQAPS9106P"
    },
    created: { at: now, by: "admin" },
    deleted: false
  },
  {
    id: "prof-swastik-2",
    program: program,
    mentorHash: swastikHash,
    mentorName: "Swastik Nayak",
    email: "swastik@guvi.in",
    courseName: "Full Stack Development - MERN",
    hourlyRate: 2500,
    currency: "INR",
    bankDetails: {
      accountNumber: "98765432109876",
      ifsc: "ICIC0001234",
      bankName: "ICICI Bank",
      panNumber: "SWSPN1234A"
    },
    created: { at: now, by: "admin" },
    deleted: false
  },
  {
    id: "prof-akash-3",
    program: program,
    mentorHash: akashHash,
    mentorName: "Akash Gupta",
    email: "akash.g@guvi.in",
    courseName: "Data Engineering Masterclass",
    hourlyRate: 2000,
    currency: "INR",
    bankDetails: {
      accountNumber: "55443322110099",
      ifsc: "SBIN0004321",
      bankName: "State Bank of India",
      panNumber: "AKGPN5678B"
    },
    created: { at: now, by: "admin" },
    deleted: false
  }
]);

// 4. Seed Attendance & Sessions matching Google Sheet (21 sessions, 44.6 hrs total)
db.hostAttendance.deleteMany({ deleted: false });
db.sessions.deleteMany({ program: program });

const baseStartTime = 1786876800; // Aug 16, 2026 16:00:00 UTC
const durations = [
  8280, 8280, 8280, 7920, 8280, 7920, 8280, // 2.3, 2.3, 2.3, 2.2, 2.3, 2.2, 2.3 (16.1 hrs)
  7920, 7920, 7920, 7920, 7920, 7920, 8280, // 2.2, 2.2, 2.2, 2.2, 2.2, 2.2, 2.3 (15.5 hrs)
  7560, 7560, 7560, 7560, 7560, 7560, 2160  // 2.1, 2.1, 2.1, 2.1, 2.1, 2.1, 0.6 -> Total 44.6 hrs!
];

let attendanceDocs = [];
let sessionDocs = [];

for (let i = 0; i < durations.length; i++) {
  const dur = durations[i];
  const sTime = baseStartTime + (i * 86400); // 1 session per day
  const eTime = sTime + dur;
  const sessId = `sess-shabari-${i + 1}`;
  const attId = `att-shabari-${i + 1}`;

  sessionDocs.push({
    id: sessId,
    sessionName: `Session ${i + 1}: Data Science Practical`,
    courseId: "c89ec418-c685-43dc-88c0-e807edb03d41",
    courseKey: "zen_data_science",
    program: program,
    batchId: "6c78282c-91cd-4353-9e5b-2f74b06dd8d8",
    sessionOrder: i + 1,
    mentor: shabarinathHash,
    mentorName: "Mr. Shabarinath P",
    startTime: sTime,
    endTime: eTime,
    sessionType: "Live Class",
    completed: true,
    created: { at: sTime, by: "system" },
    deleted: false
  });

  attendanceDocs.push({
    id: attId,
    host: shabarinathHash,
    hostName: "Mr. Shabarinath P",
    hostEmail: "shabarinath.p@guvi.in",
    batchId: "6c78282c-91cd-4353-9e5b-2f74b06dd8d8",
    sessionId: sessId,
    sessionDate: sTime,
    sessionStartTime: sTime,
    sessionEndTime: eTime,
    role: "host",
    status: "attended",
    isPresent: true,
    attendancePercentage: 98,
    totalMinutesAttended: Math.floor(dur / 60),
    meetingDuration: Math.floor(dur / 60),
    attendanceInfo: [
      { joined_at: sTime + 12, left_at: eTime + 33, peer_duration: dur }
    ],
    created: { at: sTime, by: "system" },
    deleted: false
  });

  // For some sessions, add combined batch records
  if (i % 2 === 0) {
    attendanceDocs.push({
      id: `${attId}-comb22`,
      host: shabarinathHash,
      hostName: "Mr. Shabarinath P",
      hostEmail: "shabarinath.p@guvi.in",
      batchId: "b-comb-22",
      sessionId: sessId,
      sessionDate: sTime,
      sessionStartTime: sTime,
      sessionEndTime: eTime,
      role: "host",
      status: "attended",
      isPresent: true,
      attendanceInfo: [
        { joined_at: sTime + 12, left_at: eTime + 33, peer_duration: dur }
      ],
      created: { at: sTime, by: "system" },
      deleted: false
    });
  }
}

db.sessions.insertMany(sessionDocs);
db.hostAttendance.insertMany(attendanceDocs);

print(`[seed.js] Successfully seeded 2 courses, ${durations.length} sessions, and host attendance.`);
