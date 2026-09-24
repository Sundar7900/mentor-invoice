/**
 * Database Seed Script for Mentor Invoice Feature
 * Strictly adheres to HACKATHON_RULES.md (Rule 7: No real PII, realistic synthetic fixtures)
 * Mirroring the Google Sheet example & April 2026 session records:
 * - Mentor 1: Mr. Shabarinath P (Zen Data Science, 21 sessions, 44.6 hrs, ₹3,000/hr, ₹133,800)
 * - Mentor 2: Gopi Krishnan (Devops, 1.9 hrs, 4 April 2026)
 * - Mentor 3: Sashikiran (UIUX, 0 hrs, 4 April 2026, Session Cancelled)
 * - Mentor 4: Mrudula Chaudhari (PAT, 2.2 hrs, 4 April 2026)
 * - Mentor 5: Shanmuganathan S (DM, 1.2 hrs, 4 April 2026)
 * - Mentor 6: Shyam Kumar (Business Analyst, 2.0 hrs, ₹3,500/hr, ₹7,000, 4 April 2026)
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
  },
  {
    id: "c-devops-001",
    name: "Devops Engineering Masterclass",
    courseKey: "devops_eng",
    batchCode: "DO",
    program: program,
    version: 1,
    isBatchAssigned: true,
    isActive: true,
    created: { at: 1776857464, by: "system" },
    deleted: false
  },
  {
    id: "c-uiux-002",
    name: "UIUX Design Specialization",
    courseKey: "uiux_design",
    batchCode: "UIUX",
    program: program,
    version: 1,
    isBatchAssigned: true,
    isActive: true,
    created: { at: 1776857464, by: "system" },
    deleted: false
  },
  {
    id: "c-pat-003",
    name: "PAT - Placement & Aptitude Training",
    courseKey: "pat_training",
    batchCode: "PAT",
    program: program,
    version: 1,
    isBatchAssigned: true,
    isActive: true,
    created: { at: 1776857464, by: "system" },
    deleted: false
  },
  {
    id: "c-dm-004",
    name: "Digital Marketing Specialist",
    courseKey: "digital_marketing",
    batchCode: "DM",
    program: program,
    version: 1,
    isBatchAssigned: true,
    isActive: true,
    created: { at: 1776857464, by: "system" },
    deleted: false
  },
  {
    id: "c-bmai-005",
    name: "Business Analyst & AI",
    courseKey: "business_analytics",
    batchCode: "BMAI",
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
  },
  {
    id: "b-devops-b40",
    name: "DO-C-WE-E-B40",
    language: "English",
    type: "WE",
    courseId: "c-devops-001",
    courseKey: "devops_eng",
    program: program,
    batchCompleted: false,
    created: { at: 1776857464, by: "system" },
    deleted: false
  },
  {
    id: "b-uiux-b50",
    name: "UIUX-C-WE-E-B50",
    language: "English",
    type: "WE",
    courseId: "c-uiux-002",
    courseKey: "uiux_design",
    program: program,
    batchCompleted: false,
    created: { at: 1776857464, by: "system" },
    deleted: false
  },
  {
    id: "b-pat-b24",
    name: "PAT-C-WE-E-B24",
    language: "English",
    type: "WE",
    courseId: "c-pat-003",
    courseKey: "pat_training",
    program: program,
    batchCompleted: false,
    created: { at: 1776857464, by: "system" },
    deleted: false
  },
  {
    id: "b-dm-b32",
    name: "DM-C-WE-E-B32",
    language: "English",
    type: "WE",
    courseId: "c-dm-004",
    courseKey: "digital_marketing",
    program: program,
    batchCompleted: false,
    created: { at: 1776857464, by: "system" },
    deleted: false
  },
  {
    id: "b-bmai-b63",
    name: "BMAI-C-WE-E-B63",
    language: "English",
    type: "WE",
    courseId: "c-bmai-005",
    courseKey: "business_analytics",
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
const gopiHash = "mentor-hash-gopi-krishnan-04";
const sashiHash = "mentor-hash-sashikiran-05";
const mrudulaHash = "mentor-hash-mrudula-06";
const shanmugaHash = "mentor-hash-shanmuganathan-07";
const shyamHash = "mentor-hash-shyam-08";

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
  },
  {
    id: "prof-gopi-4",
    program: program,
    mentorHash: gopiHash,
    mentorName: "Gopi Krishnan",
    email: "gopi.krishnan@guvi.in",
    courseName: "Devops Engineering Masterclass",
    hourlyRate: 2500,
    currency: "INR",
    bankDetails: {
      accountNumber: "23456789012345",
      ifsc: "HDFC0002345",
      bankName: "HDFC Bank",
      panNumber: "GPKPN1234K"
    },
    created: { at: now, by: "admin" },
    deleted: false
  },
  {
    id: "prof-sashi-5",
    program: program,
    mentorHash: sashiHash,
    mentorName: "Sashikiran",
    email: "sashikiran@guvi.in",
    courseName: "UIUX Design Specialization",
    hourlyRate: 2000,
    currency: "INR",
    bankDetails: {
      accountNumber: "34567890123456",
      ifsc: "SBIN0003456",
      bankName: "State Bank of India",
      panNumber: "SSKPN5678L"
    },
    created: { at: now, by: "admin" },
    deleted: false
  },
  {
    id: "prof-mrudula-6",
    program: program,
    mentorHash: mrudulaHash,
    mentorName: "Mrudula Chaudhari",
    email: "mrudula.c@guvi.in",
    courseName: "PAT - Placement & Aptitude Training",
    hourlyRate: 2800,
    currency: "INR",
    bankDetails: {
      accountNumber: "45678901234567",
      ifsc: "UTIB0004567",
      bankName: "Axis Bank",
      panNumber: "MCDPN9012M"
    },
    created: { at: now, by: "admin" },
    deleted: false
  },
  {
    id: "prof-shanmuga-7",
    program: program,
    mentorHash: shanmugaHash,
    mentorName: "Shanmuganathan S",
    email: "shanmuganathan.s@guvi.in",
    courseName: "Digital Marketing Specialist",
    hourlyRate: 2200,
    currency: "INR",
    bankDetails: {
      accountNumber: "56789012345678",
      ifsc: "CNRB0005678",
      bankName: "Canara Bank",
      panNumber: "SMGPN3456N"
    },
    created: { at: now, by: "admin" },
    deleted: false
  },
  {
    id: "prof-shyam-8",
    program: program,
    mentorHash: shyamHash,
    mentorName: "Shyam Kumar",
    email: "shyam.kumar@guvi.in",
    courseName: "Business Analyst & AI",
    hourlyRate: 3500,
    currency: "INR",
    bankDetails: {
      accountNumber: "67890123456789",
      ifsc: "KKBK0006789",
      bankName: "Kotak Mahindra Bank",
      panNumber: "SYMPN7890P"
    },
    created: { at: now, by: "admin" },
    deleted: false
  }
]);

// 4. Seed Attendance & Sessions
db.hostAttendance.deleteMany({ deleted: false });
db.sessions.deleteMany({ program: program });

let attendanceDocs = [];
let sessionDocs = [];

// 4.1 Shabarinath P: Aug 16 - Sep 15, 2026 (21 sessions, 44.6 hrs total)
const baseStartTime = 1786876800; // Aug 16, 2026 16:00:00 UTC
const durations = [
  8280, 8280, 8280, 7920, 8280, 7920, 8280, // 2.3, 2.3, 2.3, 2.2, 2.3, 2.2, 2.3 (16.1 hrs)
  7920, 7920, 7920, 7920, 7920, 7920, 8280, // 2.2, 2.2, 2.2, 2.2, 2.2, 2.2, 2.3 (15.5 hrs)
  7560, 7560, 7560, 7560, 7560, 7560, 2160  // 2.1, 2.1, 2.1, 2.1, 2.1, 2.1, 0.6 -> Total 44.6 hrs!
];

for (let i = 0; i < durations.length; i++) {
  const dur = durations[i];
  const sTime = baseStartTime + (i * 86400);
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

// 4.2 Additional Mentors on 4 April 2026
const apr4_10am = 1775277000; // 2026-04-04 10:00:00 IST
const apr4_12pm = 1775284200; // 2026-04-04 12:00:00 IST
const apr4_3pm  = 1775295000; // 2026-04-04 15:00:00 IST
const apr4_530pm = 1775304000; // 2026-04-04 17:30:00 IST

// 1) Gopi Krishnan - Devops - 1.9 hrs (7012s)
sessionDocs.push({
  id: "sess-gopi-1",
  sessionName: "How Modern Applications Work",
  courseId: "c-devops-001",
  courseKey: "devops_eng",
  program: program,
  batchId: "b-devops-b40",
  sessionOrder: 1,
  mentor: gopiHash,
  mentorName: "Gopi Krishnan",
  startTime: apr4_10am,
  endTime: apr4_12pm,
  sessionType: "Live Class",
  completed: true,
  created: { at: apr4_10am, by: "system" },
  deleted: false
});
attendanceDocs.push({
  id: "att-gopi-1",
  host: gopiHash,
  hostName: "Gopi Krishnan",
  hostEmail: "gopi.krishnan@guvi.in",
  batchId: "b-devops-b40",
  sessionId: "sess-gopi-1",
  sessionDate: apr4_10am,
  sessionStartTime: apr4_10am,
  sessionEndTime: apr4_12pm,
  role: "host",
  status: "attended",
  isPresent: true,
  attendancePercentage: 97,
  totalMinutesAttended: 116,
  meetingDuration: 120,
  attendanceInfo: [
    { joined_at: apr4_10am + 132, left_at: apr4_10am + 7144, peer_duration: 7012 }
  ],
  created: { at: apr4_10am, by: "system" },
  deleted: false
});

// 2) Sashikiran - UIUX - Cancelled (0 hrs)
sessionDocs.push({
  id: "sess-sashi-1",
  sessionName: "Session Cancelled",
  courseId: "c-uiux-002",
  courseKey: "uiux_design",
  program: program,
  batchId: "b-uiux-b50",
  sessionOrder: 1,
  mentor: sashiHash,
  mentorName: "Sashikiran",
  startTime: apr4_10am,
  endTime: apr4_12pm,
  sessionType: "Cancelled",
  completed: false,
  created: { at: apr4_10am, by: "system" },
  deleted: false
});
attendanceDocs.push({
  id: "att-sashi-1",
  host: sashiHash,
  hostName: "Sashikiran",
  hostEmail: "sashikiran@guvi.in",
  batchId: "b-uiux-b50",
  sessionId: "sess-sashi-1",
  sessionDate: apr4_10am,
  sessionStartTime: apr4_10am,
  sessionEndTime: apr4_12pm,
  role: "host",
  status: "cancelled",
  isPresent: false,
  attendancePercentage: 0,
  totalMinutesAttended: 0,
  meetingDuration: 120,
  attendanceInfo: [
    { joined_at: 0, left_at: 0, peer_duration: 0 }
  ],
  created: { at: apr4_10am, by: "system" },
  deleted: false
});

// 3) Mrudula Chaudhari - PAT - 2.2 hrs (8045s)
sessionDocs.push({
  id: "sess-mrudula-1",
  sessionName: "Inside an IT Project: Where Testers Fit",
  courseId: "c-pat-003",
  courseKey: "pat_training",
  program: program,
  batchId: "b-pat-b24",
  sessionOrder: 1,
  mentor: mrudulaHash,
  mentorName: "Mrudula Chaudhari",
  startTime: apr4_10am,
  endTime: apr4_12pm,
  sessionType: "Live Class",
  completed: true,
  created: { at: apr4_10am, by: "system" },
  deleted: false
});
attendanceDocs.push({
  id: "att-mrudula-1",
  host: mrudulaHash,
  hostName: "Mrudula Chaudhari",
  hostEmail: "mrudula.c@guvi.in",
  batchId: "b-pat-b24",
  sessionId: "sess-mrudula-1",
  sessionDate: apr4_10am,
  sessionStartTime: apr4_10am,
  sessionEndTime: apr4_12pm,
  role: "host",
  status: "attended",
  isPresent: true,
  attendancePercentage: 99,
  totalMinutesAttended: 134,
  meetingDuration: 120,
  attendanceInfo: [
    { joined_at: apr4_10am - 32, left_at: apr4_10am + 8013, peer_duration: 8045 }
  ],
  created: { at: apr4_10am, by: "system" },
  deleted: false
});

// 4) Shanmuganathan S - DM - 1.2 hrs (4368s)
sessionDocs.push({
  id: "sess-shanmuga-1",
  sessionName: "Marketing vs Selling",
  courseId: "c-dm-004",
  courseKey: "digital_marketing",
  program: program,
  batchId: "b-dm-b32",
  sessionOrder: 1,
  mentor: shanmugaHash,
  mentorName: "Shanmuganathan S",
  startTime: apr4_10am,
  endTime: apr4_12pm,
  sessionType: "Live Class",
  completed: true,
  created: { at: apr4_10am, by: "system" },
  deleted: false
});
attendanceDocs.push({
  id: "att-shanmuga-1",
  host: shanmugaHash,
  hostName: "Shanmuganathan S",
  hostEmail: "shanmuganathan.s@guvi.in",
  batchId: "b-dm-b32",
  sessionId: "sess-shanmuga-1",
  sessionDate: apr4_10am,
  sessionStartTime: apr4_10am,
  sessionEndTime: apr4_12pm,
  role: "host",
  status: "attended",
  isPresent: true,
  attendancePercentage: 60,
  totalMinutesAttended: 72,
  meetingDuration: 120,
  attendanceInfo: [
    { joined_at: apr4_10am - 512, left_at: apr4_10am + 3856, peer_duration: 4368 }
  ],
  created: { at: apr4_10am, by: "system" },
  deleted: false
});

// 5) Shyam Kumar - Business Analyst - 2.0 hrs (7364s), Rate ₹3,500, Total ₹7,000
sessionDocs.push({
  id: "sess-shyam-1",
  sessionName: "Business Analytics Basics.",
  courseId: "c-bmai-005",
  courseKey: "business_analytics",
  program: program,
  batchId: "b-bmai-b63",
  sessionOrder: 1,
  mentor: shyamHash,
  mentorName: "Shyam Kumar",
  startTime: apr4_3pm,
  endTime: apr4_530pm,
  sessionType: "Live Class",
  completed: true,
  created: { at: apr4_3pm, by: "system" },
  deleted: false
});
attendanceDocs.push({
  id: "att-shyam-1",
  host: shyamHash,
  hostName: "Shyam Kumar",
  hostEmail: "shyam.kumar@guvi.in",
  batchId: "b-bmai-b63",
  sessionId: "sess-shyam-1",
  sessionDate: apr4_3pm,
  sessionStartTime: apr4_3pm,
  sessionEndTime: apr4_530pm,
  role: "host",
  status: "attended",
  isPresent: true,
  attendancePercentage: 98,
  totalMinutesAttended: 122,
  meetingDuration: 150,
  attendanceInfo: [
    { joined_at: apr4_3pm + 24, left_at: apr4_3pm + 7388, peer_duration: 7364 }
  ],
  created: { at: apr4_3pm, by: "system" },
  deleted: false
});

db.sessions.insertMany(sessionDocs);
db.hostAttendance.insertMany(attendanceDocs);

print(`[seed.js] Successfully seeded 7 courses, 9 batches, 8 mentor profiles, and ${attendanceDocs.length} attendance records.`);
