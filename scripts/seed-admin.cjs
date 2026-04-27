/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const collegesAndDepartments = {
  "College of Agriculture, Engineering and Science": {
    code: "COAES",
    departments: {
      Microbiology: "MIC",
      "Pure & Applied Biology": "BIO",
      Biochemistry: "BCH",
      "Industrial Chemistry": "CHM",
      Mathematics: "MTH",
      Statistics: "STA",
      Physics: "PHY",
      "Bachelor of Agriculture (B.Agric.)": "AGR",
      "Food Science and Technology": "FST",
      "Electrical/Electronics Engineering": "EEE",
      "Mechatronics Engineering": "MCT",
      "Agricultural Extension & Rural Development": "AER",
    },
  },
  "College of Management and Social Sciences": {
    code: "COMSS",
    departments: {
      Accounting: "ACC",
      "Banking and Finance": "BNF",
      "Business Administration": "BUS",
      "Industrial Relations & Personnel Management": "IRP",
      Economics: "ECO",
      Sociology: "SOC",
      "Political Science": "POL",
      "International Relations": "INT",
      "Political and Law": "PAL",
    },
  },
  "College of Law": {
    code: "COLAW",
    departments: {
      "Law (LL.B.)": "LAW",
    },
  },
  "College of Liberal Studies": {
    code: "COLBS",
    departments: {
      Music: "MUS",
      "Theatre Arts": "THA",
      English: "ENG",
      "History & International Studies": "HIS",
      "Religious Studies": "REL",
    },
  },
  "College of Health Sciences": {
    code: "COHES",
    departments: {
      Anatomy: "ANA",
      Physiology: "PHS",
      "Medicine & Surgery (MBBS)": "MED",
      "Nursing Science": "NUR",
      Physiotherapy: "PHT",
      "Public Health": "PHU",
      "Medical Laboratory Science (BMLS)": "MLS",
      "Nutrition & Dietetics": "NUT",
    },
  },
  "College of Computing and Communication Studies": {
    code: "COCCS",
    departments: {
      "Computer Science": "CSC",
      "Mass Communication": "MAS",
      "Communication Arts": "CMA",
      "Cyber Security": "CYB",
      "Software Engineering": "SEN",
      "Information Technology": "IFT",
    },
  },
  "College of Environmental Sciences": {
    code: "COEVS",
    departments: {
      Architecture: "ARC",
    },
  },
};

const hodNames = [
  "Prof. Adebayo",
  "Prof. Chidera",
  "Prof. Temitope",
  "Prof. Zainab",
  "Prof. Ifeoma",
  "Prof. Daniel",
  "Prof. Samuel",
  "Prof. Precious",
  "Prof. Favour",
  "Prof. Kehinde",
  "Prof. Mariam",
  "Prof. Oluwaseun",
];

function levelToYear(level) {
  const parsed = Number(level);
  if (!Number.isFinite(parsed)) return 1;
  return Math.max(1, Math.round(parsed / 100));
}

function parseEnv(filePath) {
  const env = {};
  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return env;
}

(async () => {
  const env = parseEnv(path.join(process.cwd(), ".env.local"));
  const mongoUri = env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI missing in .env.local");
  }

  await mongoose.connect(mongoUri, { bufferCommands: false });

  const userSchema = new mongoose.Schema(
    {
      email: { type: String, unique: true, lowercase: true, trim: true },
      password: { type: String, select: false },
      firstName: String,
      lastName: String,
      role: String,
      status: String,
      isEmailVerified: Boolean,
      emailVerifiedAt: Date,
      lastLoginAt: Date,
    },
    { timestamps: true },
  );

  const User = mongoose.models.User || mongoose.model("User", userSchema);
  const db = mongoose.connection.db;
  const sessions = db.collection("sessions");
  const accounts = db.collection("accounts");
  const verificationTokens = db.collection("emailverificationtokens");
  const resetTokens = db.collection("passwordresettokens");
  const studentProfiles = db.collection("studentprofiles");
  const advisorStudentConnections = db.collection("advisorstudentconnections");

  // ── Extra Mongoose models for rich seed data ──────────────────────
  const appointmentSeedSchema = new mongoose.Schema(
    {
      advisorId: mongoose.Schema.Types.ObjectId,
      studentId: mongoose.Schema.Types.ObjectId,
      requestedBy: mongoose.Schema.Types.ObjectId,
      scheduledFor: Date,
      agenda: String,
      notes: String,
      status: { type: String, default: "REQUESTED" },
    },
    { timestamps: true },
  );
  const caseNoteSeedSchema = new mongoose.Schema(
    {
      advisorId: mongoose.Schema.Types.ObjectId,
      studentId: mongoose.Schema.Types.ObjectId,
      title: String,
      content: String,
      tags: [String],
    },
    { timestamps: true },
  );
  const chatMessageSeedSchema = new mongoose.Schema(
    {
      senderId: mongoose.Schema.Types.ObjectId,
      recipientId: mongoose.Schema.Types.ObjectId,
      content: String,
      readAt: Date,
    },
    { timestamps: true },
  );
  const platformSettingSeedSchema = new mongoose.Schema(
    { key: { type: String, unique: true }, value: mongoose.Schema.Types.Mixed },
    { timestamps: true },
  );
  const collegeCatalogSeedSchema = new mongoose.Schema(
    {
      name: { type: String, unique: true },
      code: { type: String, unique: true },
      levels: [String],
    },
    { timestamps: true },
  );
  const departmentCatalogSeedSchema = new mongoose.Schema(
    { college: String, name: String, levels: [String] },
    { timestamps: true },
  );
  const advisorAvailabilitySeedSchema = new mongoose.Schema(
    {
      advisorId: mongoose.Schema.Types.ObjectId,
      dayOfWeek: Number,
      startTime: String,
      endTime: String,
      isRecurring: { type: Boolean, default: true },
      specificDate: Date,
      isBooked: { type: Boolean, default: false },
      bookedBy: mongoose.Schema.Types.ObjectId,
    },
    { timestamps: true },
  );
  const advisorRatingSeedSchema = new mongoose.Schema(
    {
      advisorId: mongoose.Schema.Types.ObjectId,
      studentId: mongoose.Schema.Types.ObjectId,
      appointmentId: mongoose.Schema.Types.ObjectId,
      rating: Number,
      review: String,
    },
    { timestamps: true },
  );
  const testimonialSeedSchema = new mongoose.Schema(
    {
      authorId: mongoose.Schema.Types.ObjectId,
      authorRole: String,
      authorName: String,
      authorTitle: String,
      quote: String,
      rating: Number,
      isApproved: { type: Boolean, default: false },
      isPublished: { type: Boolean, default: false },
    },
    { timestamps: true },
  );
  const contactSubmissionSeedSchema = new mongoose.Schema(
    {
      name: String,
      email: String,
      message: String,
      type: String,
      organization: String,
      phone: String,
      budget: String,
      isRead: { type: Boolean, default: false },
    },
    { timestamps: true },
  );

  const AppointmentM =
    mongoose.models.Appointment ||
    mongoose.model("Appointment", appointmentSeedSchema);
  const CaseNoteM =
    mongoose.models.CaseNote || mongoose.model("CaseNote", caseNoteSeedSchema);
  const ChatMessageM =
    mongoose.models.ChatMessage ||
    mongoose.model("ChatMessage", chatMessageSeedSchema);
  const PlatformSettingM =
    mongoose.models.PlatformSetting ||
    mongoose.model("PlatformSetting", platformSettingSeedSchema);
  const CollegeCatalogM =
    mongoose.models.CollegeCatalog ||
    mongoose.model("CollegeCatalog", collegeCatalogSeedSchema);
  const DepartmentCatalogM =
    mongoose.models.DepartmentCatalog ||
    mongoose.model("DepartmentCatalog", departmentCatalogSeedSchema);
  const AdvisorAvailabilityM =
    mongoose.models.AdvisorAvailability ||
    mongoose.model("AdvisorAvailability", advisorAvailabilitySeedSchema);
  const AdvisorRatingM =
    mongoose.models.AdvisorRating ||
    mongoose.model("AdvisorRating", advisorRatingSeedSchema);
  const TestimonialM =
    mongoose.models.Testimonial ||
    mongoose.model("Testimonial", testimonialSeedSchema);
  const ContactSubmissionM =
    mongoose.models.ContactSubmission ||
    mongoose.model("ContactSubmission", contactSubmissionSeedSchema);

  const canonicalUsers = [
    {
      email: "admin@gmail.com",
      password: "123456",
      firstName: "SAGE",
      lastName: "Admin",
      role: "ADMIN",
      status: "ACTIVE",
      profile: null,
    },
    {
      email: "advisor@gmail.com",
      password: "123456",
      firstName: "SAGE",
      lastName: "Advisor",
      role: "ADVISOR",
      status: "ACTIVE",
      profile: null,
    },
    {
      email: "pending.advisor@gmail.com",
      password: "123456",
      firstName: "Pending",
      lastName: "Advisor",
      role: "ADVISOR",
      status: "PENDING_APPROVAL",
      profile: null,
    },
    {
      email: "student@gmail.com",
      password: "123456",
      firstName: "SAGE",
      lastName: "Student",
      role: "STUDENT",
      status: "ACTIVE",
      profile: {
        studentId: "BU26CSC0001",
        college: "College of Computing and Communication Studies",
        department: "Computer Science",
        program: "Computer Science",
        level: "300",
        year: 3,
        phone: "+2348000000000",
      },
    },
  ];

  const firstNames = [
    "Adebayo",
    "Chidera",
    "Temitope",
    "Zainab",
    "Ifeoma",
    "Daniel",
    "Samuel",
    "Precious",
    "Favour",
    "Kehinde",
    "Mariam",
    "Oluwaseun",
  ];
  const lastNames = [
    "Adeyemi",
    "Okafor",
    "Akinola",
    "Balogun",
    "Ibrahim",
    "Nwankwo",
    "Ogunleye",
    "Eze",
    "Sanni",
    "Adewale",
    "Ajayi",
    "Abiola",
  ];

  const seedYear = new Date().getFullYear().toString().slice(-2);
  let sequence = 2;
  let nameIndex = 0;
  let hodIndex = 0;

  const generatedAdvisors = [];
  const generatedStudents = [];

  for (const [collegeName, collegeInfo] of Object.entries(
    collegesAndDepartments,
  )) {
    const departments = Object.entries(collegeInfo.departments).map(
      ([departmentName, departmentCode]) => {
        const hod = hodNames[hodIndex % hodNames.length];
        hodIndex += 1;

        let availableLevels = ["100", "200", "300", "400"];
        if (
          departmentName.includes("Medicine") ||
          departmentName.includes("MBBS") ||
          departmentName.includes("Law") ||
          departmentName.includes("Architecture")
        ) {
          availableLevels = ["100", "200", "300", "400", "500", "600"];
        } else if (
          (departmentName.includes("Engineering") &&
            !departmentName.includes("Software Engineering")) ||
          departmentName.includes("Pharmacy")
        ) {
          availableLevels = ["100", "200", "300", "400", "500"];
        }

        return {
          departmentName,
          departmentCode,
          hod,
          availableLevels,
        };
      },
    );

    for (const departmentInfo of departments) {
      const advisorFullName = departmentInfo.hod.replace("Prof. ", "").trim();
      const [
        advisorFirst = firstNames[nameIndex % firstNames.length],
        advisorLast = lastNames[nameIndex % lastNames.length],
      ] = advisorFullName.split(/\s+/, 2);
      nameIndex += 1;

      generatedAdvisors.push({
        email: `advisor.${collegeInfo.code.toLowerCase()}.${departmentInfo.departmentCode.toLowerCase()}@bellsuniversity.edu.ng`,
        password: "123456",
        firstName: advisorFirst,
        lastName: advisorLast,
        role: "ADVISOR",
        status: "ACTIVE",
        profile: null,
        college: collegeName,
        department: departmentInfo.departmentName,
      });

      for (
        let i = 0;
        i < Math.min(departmentInfo.availableLevels.length, 3);
        i += 1
      ) {
        const level = departmentInfo.availableLevels[i];
        const number = String(sequence).padStart(4, "0");
        const matricNumber = `BU${seedYear}${departmentInfo.departmentCode}${number}`;
        const firstName = firstNames[nameIndex % firstNames.length];
        const lastName = lastNames[nameIndex % lastNames.length];
        nameIndex += 1;
        sequence += 1;

        generatedStudents.push({
          email: `${matricNumber.toLowerCase()}@student.bellsuniversity.edu.ng`,
          password: "123456",
          firstName,
          lastName,
          role: "STUDENT",
          status: "ACTIVE",
          profile: {
            studentId: matricNumber,
            college: collegeName,
            department: departmentInfo.departmentName,
            program: departmentInfo.departmentName,
            level,
            year: levelToYear(level),
            phone: "+2348000000000",
          },
          college: collegeName,
          department: departmentInfo.departmentName,
        });
      }
    }
  }

  const allSeedUsers = [
    ...canonicalUsers,
    ...generatedAdvisors,
    ...generatedStudents,
  ];

  const hashedPasswords = await Promise.all(
    allSeedUsers.map(async (user) => bcrypt.hash(user.password, 12)),
  );

  // Clear all platform data so each seed run starts fresh
  await Promise.all([
    AppointmentM.deleteMany({}),
    CaseNoteM.deleteMany({}),
    ChatMessageM.deleteMany({}),
    PlatformSettingM.deleteMany({}),
    CollegeCatalogM.deleteMany({}),
    DepartmentCatalogM.deleteMany({}),
    AdvisorAvailabilityM.deleteMany({}),
    AdvisorRatingM.deleteMany({}),
    TestimonialM.deleteMany({}),
    ContactSubmissionM.deleteMany({}),
  ]);

  const existingAdmins = await User.find({ role: "ADMIN" }).select("_id email");
  const adminIds = existingAdmins.map((admin) => admin._id);

  if (adminIds.length > 0) {
    await Promise.all([
      sessions.deleteMany({ userId: { $in: adminIds } }),
      accounts.deleteMany({ userId: { $in: adminIds } }),
      verificationTokens.deleteMany({ userId: { $in: adminIds } }),
      resetTokens.deleteMany({ userId: { $in: adminIds } }),
      studentProfiles.deleteMany({ userId: { $in: adminIds } }),
      advisorStudentConnections.deleteMany({
        $or: [
          { advisorId: { $in: adminIds } },
          { studentId: { $in: adminIds } },
        ],
      }),
      User.deleteMany({ _id: { $in: adminIds } }),
    ]);
  }

  const existingCanonicalUsers = await User.find({
    email: { $in: allSeedUsers.map((user) => user.email) },
  }).select("_id email");

  const canonicalUserIds = existingCanonicalUsers.map((user) => user._id);

  if (canonicalUserIds.length > 0) {
    await Promise.all([
      sessions.deleteMany({ userId: { $in: canonicalUserIds } }),
      accounts.deleteMany({ userId: { $in: canonicalUserIds } }),
      verificationTokens.deleteMany({ userId: { $in: canonicalUserIds } }),
      resetTokens.deleteMany({ userId: { $in: canonicalUserIds } }),
      studentProfiles.deleteMany({ userId: { $in: canonicalUserIds } }),
      advisorStudentConnections.deleteMany({
        $or: [
          { advisorId: { $in: canonicalUserIds } },
          { studentId: { $in: canonicalUserIds } },
        ],
      }),
      User.deleteMany({ _id: { $in: canonicalUserIds } }),
    ]);
  }

  const createdUsers = [];

  for (const [index, seedUser] of allSeedUsers.entries()) {
    const createdUser = await User.create({
      email: seedUser.email,
      password: hashedPasswords[index],
      firstName: seedUser.firstName,
      lastName: seedUser.lastName,
      role: seedUser.role,
      status: seedUser.status,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
    });

    if (seedUser.profile) {
      await studentProfiles.insertOne({
        userId: createdUser._id,
        ...seedUser.profile,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    createdUsers.push(createdUser);
  }

  const advisorByEmail = new Map(
    createdUsers
      .filter((user) => user.role === "ADVISOR")
      .map((advisor) => [advisor.email, advisor]),
  );

  const studentDocs = createdUsers.filter((user) => user.role === "STUDENT");
  const profileDocs = await studentProfiles
    .find({ userId: { $in: studentDocs.map((item) => item._id) } })
    .toArray();

  const advisorMapByCollegeAndDepartment = new Map();
  const advisorMapByCollege = new Map();
  for (const advisorSeed of generatedAdvisors) {
    const advisorDoc = advisorByEmail.get(advisorSeed.email);
    if (advisorDoc) {
      advisorMapByCollegeAndDepartment.set(
        `${advisorSeed.college}::${advisorSeed.department ?? ""}`,
        advisorDoc._id,
      );
      advisorMapByCollege.set(advisorSeed.college, advisorDoc._id);
    }
  }

  for (const profile of profileDocs) {
    const advisorId =
      advisorMapByCollegeAndDepartment.get(
        `${profile.college ?? ""}::${profile.department ?? ""}`,
      ) ?? advisorMapByCollege.get(profile.college);
    if (!advisorId) continue;
    await advisorStudentConnections.updateOne(
      {
        advisorId,
        studentId: profile.userId,
      },
      {
        $set: {
          requestedBy: profile.userId,
          status: "ACCEPTED",
          acceptedAt: new Date(),
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );
  }

  // ── Rich data seeding ─────────────────────────────────────────────
  const day = 24 * 60 * 60 * 1000;
  const now = Date.now();

  const canonicalAdvisorUser = createdUsers.find(
    (u) => u.email === "advisor@gmail.com",
  );
  const canonicalStudentUser = createdUsers.find(
    (u) => u.email === "student@gmail.com",
  );

  if (canonicalAdvisorUser && canonicalStudentUser) {
    await advisorStudentConnections.updateOne(
      {
        advisorId: canonicalAdvisorUser._id,
        studentId: canonicalStudentUser._id,
      },
      {
        $set: {
          requestedBy: canonicalStudentUser._id,
          status: "ACCEPTED",
          acceptedAt: new Date(),
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );
  }

  // Appointments – canonical pair
  let canonicalAppointmentDocs = [];
  if (canonicalAdvisorUser && canonicalStudentUser) {
    canonicalAppointmentDocs = await AppointmentM.insertMany([
      {
        advisorId: canonicalAdvisorUser._id,
        studentId: canonicalStudentUser._id,
        requestedBy: canonicalStudentUser._id,
        scheduledFor: new Date(now - 21 * day),
        agenda: "Academic standing review – GPA improvement strategy",
        notes:
          "Student is managing course load. Identified 2 units at risk. Agreed on weekly check-ins and supplemental instruction for Statistics.",
        status: "COMPLETED",
        createdAt: new Date(now - 23 * day),
        updatedAt: new Date(now - 21 * day),
      },
      {
        advisorId: canonicalAdvisorUser._id,
        studentId: canonicalStudentUser._id,
        requestedBy: canonicalStudentUser._id,
        scheduledFor: new Date(now + 7 * day),
        agenda: "Semester course selection and credit load planning",
        status: "CONFIRMED",
        createdAt: new Date(now - 3 * day),
        updatedAt: new Date(now - 1 * day),
      },
      {
        advisorId: canonicalAdvisorUser._id,
        studentId: canonicalStudentUser._id,
        requestedBy: canonicalStudentUser._id,
        scheduledFor: new Date(now + 21 * day),
        agenda: "Internship applications and career readiness discussion",
        status: "REQUESTED",
        createdAt: new Date(now - 1 * day),
        updatedAt: new Date(now - 1 * day),
      },
    ]);
  }

  if (canonicalAdvisorUser && canonicalStudentUser) {
    await AdvisorAvailabilityM.insertMany([
      {
        advisorId: canonicalAdvisorUser._id,
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "10:00",
        isRecurring: true,
        isBooked: false,
        createdAt: new Date(now - 10 * day),
        updatedAt: new Date(now - 10 * day),
      },
      {
        advisorId: canonicalAdvisorUser._id,
        dayOfWeek: 3,
        startTime: "14:00",
        endTime: "15:00",
        isRecurring: true,
        isBooked: false,
        createdAt: new Date(now - 10 * day),
        updatedAt: new Date(now - 10 * day),
      },
      {
        advisorId: canonicalAdvisorUser._id,
        dayOfWeek: 5,
        startTime: "11:00",
        endTime: "12:00",
        isRecurring: true,
        isBooked: false,
        createdAt: new Date(now - 10 * day),
        updatedAt: new Date(now - 10 * day),
      },
      {
        advisorId: canonicalAdvisorUser._id,
        specificDate: new Date(now + 12 * day),
        startTime: "13:00",
        endTime: "14:00",
        isRecurring: false,
        isBooked: true,
        bookedBy: canonicalStudentUser._id,
        createdAt: new Date(now - 2 * day),
        updatedAt: new Date(now - 1 * day),
      },
    ]);
  }

  // Appointments – first 5 generated pairs
  const allConnections = await advisorStudentConnections
    .find({ status: "ACCEPTED" })
    .limit(8)
    .toArray();

  let appointmentCount = 0;
  const generatedCompletedAppointments = [];
  for (const conn of allConnections) {
    if (appointmentCount >= 5) break;
    const isCanonical =
      conn.advisorId.toString() === canonicalAdvisorUser?._id?.toString() ||
      conn.studentId.toString() === canonicalStudentUser?._id?.toString();
    if (isCanonical) continue;
    const insertedAppointments = await AppointmentM.insertMany([
      {
        advisorId: conn.advisorId,
        studentId: conn.studentId,
        requestedBy: conn.studentId,
        scheduledFor: new Date(now - (8 + appointmentCount * 4) * day),
        agenda: "Introductory advising session – academic plan overview",
        notes:
          "Initial assessment complete. Student is on track. Recommended course adjustments for upcoming semester.",
        status: "COMPLETED",
        createdAt: new Date(now - (10 + appointmentCount * 4) * day),
        updatedAt: new Date(now - (8 + appointmentCount * 4) * day),
      },
      {
        advisorId: conn.advisorId,
        studentId: conn.studentId,
        requestedBy: conn.studentId,
        scheduledFor: new Date(now + (4 + appointmentCount * 3) * day),
        agenda: "Semester progress check-in",
        status: "CONFIRMED",
        createdAt: new Date(now - 2 * day),
        updatedAt: new Date(now - 1 * day),
      },
    ]);
    generatedCompletedAppointments.push(insertedAppointments[0]);
    appointmentCount += 1;
  }

  if (
    canonicalAdvisorUser &&
    canonicalStudentUser &&
    canonicalAppointmentDocs[0]
  ) {
    await AdvisorRatingM.create({
      advisorId: canonicalAdvisorUser._id,
      studentId: canonicalStudentUser._id,
      appointmentId: canonicalAppointmentDocs[0]._id,
      rating: 5,
      review:
        "Professional, clear, and genuinely helpful. My advisor gave me a concrete plan for improving my GPA and followed up afterwards.",
      createdAt: new Date(now - 20 * day),
      updatedAt: new Date(now - 20 * day),
    });
  }

  const extraRatings = generatedCompletedAppointments
    .slice(0, 3)
    .map((appointment, index) => ({
      advisorId: appointment.advisorId,
      studentId: appointment.studentId,
      appointmentId: appointment._id,
      rating: [4, 5, 5][index],
      review: [
        "Very attentive and easy to talk to. I left the session with a clear next step.",
        "Excellent advising session. The recommendations were realistic and well explained.",
        "Helpful, organised, and encouraging throughout the session.",
      ][index],
      createdAt: new Date(now - (14 - index) * day),
      updatedAt: new Date(now - (14 - index) * day),
    }));
  if (extraRatings.length > 0) {
    await AdvisorRatingM.insertMany(extraRatings);
  }

  // Case notes – canonical pair
  if (canonicalAdvisorUser && canonicalStudentUser) {
    await CaseNoteM.insertMany([
      {
        advisorId: canonicalAdvisorUser._id,
        studentId: canonicalStudentUser._id,
        title: "Initial assessment",
        content:
          "Student presented concerns about course load management and GPA. Discussed realistic goal-setting and time management. Student appears motivated but needs structured support. Recommended supplemental instruction for Mathematics.",
        tags: ["onboarding", "gpa", "time-management"],
        createdAt: new Date(now - 25 * day),
        updatedAt: new Date(now - 25 * day),
      },
      {
        advisorId: canonicalAdvisorUser._id,
        studentId: canonicalStudentUser._id,
        title: "Mid-semester follow-up",
        content:
          "Reviewed mid-semester progress. Student improved attendance by 90%. GPA trending from 2.8 to 3.1. Recommended elective swap for better workload balance. Next steps: course registration for 400 level.",
        tags: ["follow-up", "gpa", "course-registration"],
        createdAt: new Date(now - 14 * day),
        updatedAt: new Date(now - 14 * day),
      },
      {
        advisorId: canonicalAdvisorUser._id,
        studentId: canonicalStudentUser._id,
        title: "Career readiness planning",
        content:
          "Mapped internship opportunities aligned with software development path. Student cleared for 18 credit hours next semester. Identified 2 industry certifications as extracurricular goals.",
        tags: ["career", "internship", "planning"],
        createdAt: new Date(now - 3 * day),
        updatedAt: new Date(now - 3 * day),
      },
    ]);
  }

  // Case notes – first 3 generated pairs
  let noteCount = 0;
  for (const conn of allConnections) {
    if (noteCount >= 3) break;
    const isCanonicalAdv =
      conn.advisorId.toString() === canonicalAdvisorUser?._id?.toString();
    if (isCanonicalAdv) continue;
    await CaseNoteM.insertOne({
      advisorId: conn.advisorId,
      studentId: conn.studentId,
      title: "Initial advising session",
      content:
        "Completed introductory meeting. Reviewed student academic history and identified key focus areas for the semester. Student is engaged and responsive. Follow-up scheduled.",
      tags: ["onboarding"],
      createdAt: new Date(now - (12 + noteCount * 5) * day),
      updatedAt: new Date(now - (12 + noteCount * 5) * day),
    });
    noteCount += 1;
  }

  // Chat messages – canonical pair
  if (canonicalAdvisorUser && canonicalStudentUser) {
    const dialogue = [
      {
        senderId: canonicalAdvisorUser._id,
        recipientId: canonicalStudentUser._id,
        content:
          "Hi SAGE Student! Welcome to the platform. I'm your assigned academic advisor. Feel free to reach out whenever you need guidance.",
        offset: -20 * day,
      },
      {
        senderId: canonicalStudentUser._id,
        recipientId: canonicalAdvisorUser._id,
        content:
          "Thank you so much! I'm really glad to have a dedicated advisor. I had some questions about my course plan for next semester.",
        offset: -20 * day + 2 * 60 * 1000,
      },
      {
        senderId: canonicalAdvisorUser._id,
        recipientId: canonicalStudentUser._id,
        content:
          "Of course! I've reviewed your profile and already scheduled an appointment for next week so we can go through your semester plan in detail.",
        offset: -20 * day + 6 * 60 * 1000,
      },
      {
        senderId: canonicalStudentUser._id,
        recipientId: canonicalAdvisorUser._id,
        content:
          "Perfect! I'll prepare a list of courses I'm considering. Is there anything specific I should bring to the session?",
        offset: -20 * day + 10 * 60 * 1000,
      },
      {
        senderId: canonicalAdvisorUser._id,
        recipientId: canonicalStudentUser._id,
        content:
          "Bring your current transcript and any career goals you have in mind. See you then!",
        offset: -20 * day + 15 * 60 * 1000,
      },
      {
        senderId: canonicalStudentUser._id,
        recipientId: canonicalAdvisorUser._id,
        content: "Great, I'll have everything ready. Thank you!",
        offset: -20 * day + 18 * 60 * 1000,
      },
    ];
    await ChatMessageM.insertMany(
      dialogue.map((m) => ({
        senderId: m.senderId,
        recipientId: m.recipientId,
        content: m.content,
        readAt: new Date(now + 1000),
        createdAt: new Date(now + m.offset),
        updatedAt: new Date(now + m.offset),
      })),
    );
  }

  // Chat messages – first 3 generated pairs
  let msgCount = 0;
  for (const conn of allConnections) {
    if (msgCount >= 3) break;
    const isCanonicalAdv =
      conn.advisorId.toString() === canonicalAdvisorUser?._id?.toString();
    if (isCanonicalAdv) continue;
    await ChatMessageM.insertMany([
      {
        senderId: conn.advisorId,
        recipientId: conn.studentId,
        content:
          "Welcome! I'm your academic advisor on SAGE. Don't hesitate to message me with any questions or concerns.",
        readAt: new Date(now + 1000),
        createdAt: new Date(now - (15 + msgCount * 3) * day),
        updatedAt: new Date(now - (15 + msgCount * 3) * day),
      },
      {
        senderId: conn.studentId,
        recipientId: conn.advisorId,
        content: "Thank you! Looking forward to our advising sessions.",
        readAt: new Date(now + 1000),
        createdAt: new Date(now - (15 + msgCount * 3) * day + 5 * 60 * 1000),
        updatedAt: new Date(now - (15 + msgCount * 3) * day + 5 * 60 * 1000),
      },
    ]);
    msgCount += 1;
  }

  // Platform settings
  await PlatformSettingM.findOneAndUpdate(
    { key: "platform" },
    {
      $set: {
        value: {
          allowRegistration: true,
          maintenanceMode: false,
          supportEmail: "info@bowenuniversity.edu.ng",
          defaultStudentYear: 1,
          maxMessageLength: 2000,
          notifyAdminsOnNewUser: true,
        },
        updatedAt: new Date(),
      },
      $setOnInsert: { key: "platform", createdAt: new Date() },
    },
    { upsert: true },
  );

  // College & department catalogs
  for (const [collegeName, collegeInfo] of Object.entries(
    collegesAndDepartments,
  )) {
    await CollegeCatalogM.findOneAndUpdate(
      { name: collegeName },
      {
        $set: {
          code: collegeInfo.code,
          levels: ["100", "200", "300", "400"],
          updatedAt: new Date(),
        },
        $setOnInsert: { name: collegeName, createdAt: new Date() },
      },
      { upsert: true },
    );
    for (const [deptName] of Object.entries(collegeInfo.departments)) {
      let deptLevels = ["100", "200", "300", "400"];
      if (
        deptName.includes("Medicine") ||
        deptName.includes("MBBS") ||
        deptName.includes("Law") ||
        deptName.includes("Architecture")
      ) {
        deptLevels = ["100", "200", "300", "400", "500", "600"];
      } else if (
        deptName.includes("Engineering") &&
        !deptName.includes("Software")
      ) {
        deptLevels = ["100", "200", "300", "400", "500"];
      }
      await DepartmentCatalogM.findOneAndUpdate(
        { college: collegeName, name: deptName },
        {
          $set: { levels: deptLevels, updatedAt: new Date() },
          $setOnInsert: {
            college: collegeName,
            name: deptName,
            createdAt: new Date(),
          },
        },
        { upsert: true },
      );
    }
  }

  if (canonicalAdvisorUser && canonicalStudentUser) {
    await TestimonialM.insertMany([
      {
        authorId: canonicalStudentUser._id,
        authorRole: "STUDENT",
        authorName: "SAGE Student",
        authorTitle: "Computer Science Student, Bowen University",
        quote:
          "SAGE made it easy to connect with my advisor and stay on top of my academic plan. Booking sessions and following up has never been this smooth.",
        rating: 5,
        isApproved: true,
        isPublished: true,
        createdAt: new Date(now - 18 * day),
        updatedAt: new Date(now - 18 * day),
      },
      {
        authorId: canonicalAdvisorUser._id,
        authorRole: "ADVISOR",
        authorName: "SAGE Advisor",
        authorTitle: "Academic Advisor, Bowen University",
        quote:
          "The availability, note-taking, and student messaging features help me stay organised and support each student more effectively.",
        rating: 5,
        isApproved: true,
        isPublished: true,
        createdAt: new Date(now - 15 * day),
        updatedAt: new Date(now - 15 * day),
      },
      {
        authorId: canonicalStudentUser._id,
        authorRole: "STUDENT",
        authorName: "SAGE Student",
        authorTitle: "Bowen University Undergraduate",
        quote:
          "I appreciate how professional the platform feels. My advisor's free times are clear, and every appointment feels well prepared.",
        rating: 4,
        isApproved: true,
        isPublished: true,
        createdAt: new Date(now - 12 * day),
        updatedAt: new Date(now - 12 * day),
      },
    ]);
  }

  await ContactSubmissionM.insertMany([
    {
      name: "Admissions Office",
      email: "contact@bowen-demo.edu.ng",
      message:
        "We would like to explore deploying SAGE across multiple departments for academic advising and student support.",
      type: "get-quote",
      organization: "Bowen University Demo Office",
      phone: "123456789",
      budget: "₦2M - ₦5M",
      isRead: false,
      status: "OPEN",
      createdAt: new Date(now - 7 * day),
      updatedAt: new Date(now - 7 * day),
    },
    {
      name: "Prospective Partner",
      email: "hello@example.org",
      message:
        "I would like to know whether SAGE supports advisor availability, student ratings, and institution-wide reporting.",
      type: "say-hi",
      isRead: false,
      status: "OPEN",
      createdAt: new Date(now - 3 * day),
      updatedAt: new Date(now - 3 * day),
    },
    {
      name: "Student Affairs Office",
      email: "studentaffairs@bowen-demo.edu.ng",
      message:
        "Please confirm the turnaround time for support escalations and whether we can assign internal owners to each request.",
      type: "say-hi",
      isRead: true,
      status: "REVIEWED",
      createdAt: new Date(now - 2 * day),
      updatedAt: new Date(now - 2 * day),
    },
  ]);

  console.log(
    "Rich seed data ready ✅  (appointments, availability, ratings, testimonials, contact, case notes, messages, settings, catalogs)",
  );
  console.log("Seed users ready ✅");
  console.log(`Cleared existing admin accounts: ${existingAdmins.length}`);
  console.log(`Recreated accounts: ${createdUsers.length}`);
  console.log(
    `Generated advisors: ${generatedAdvisors.length}, students: ${generatedStudents.length}`,
  );

  for (const user of createdUsers) {
    console.log("---");
    console.log(`Email: ${user.email}`);
    console.log("Password: 123456");
    console.log(`Role: ${user.role}`);
    console.log(`Status: ${user.status}`);
  }

  await mongoose.disconnect();
})().catch(async (error) => {
  console.error("Seed failed ❌", error?.message || error);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
