const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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

  const canonicalUsers = [
    {
      email: "sage@gmail.com",
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
      email: "student@gmail.com",
      password: "123456",
      firstName: "SAGE",
      lastName: "Student",
      role: "STUDENT",
      status: "ACTIVE",
      profile: {
        studentId: "SAGE-STUDENT-001",
        department: "Computer Science",
        program: "BSc Software Engineering",
        year: 3,
        phone: "+2348000000000",
      },
    },
  ];

  const hashedPasswords = await Promise.all(
    canonicalUsers.map(async (user) => bcrypt.hash(user.password, 12)),
  );

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
    email: { $in: canonicalUsers.map((user) => user.email) },
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

  for (const [index, seedUser] of canonicalUsers.entries()) {
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

  const advisorUser = createdUsers.find((user) => user.role === "ADVISOR");
  const studentUser = createdUsers.find((user) => user.role === "STUDENT");

  if (advisorUser && studentUser) {
    await advisorStudentConnections.insertOne({
      advisorId: advisorUser._id,
      studentId: studentUser._id,
      requestedBy: studentUser._id,
      status: "ACCEPTED",
      acceptedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  console.log("Seed users ready ✅");
  console.log(`Cleared existing admin accounts: ${existingAdmins.length}`);
  console.log(
    `Recreated canonical accounts: ${createdUsers.map((user) => user.email).join(", ")}`,
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
