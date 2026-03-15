const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");

function parseEnv(filePath) {
  const env = {};
  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    env[key] = value;
  }
  return env;
}

(async () => {
  const baseUrl = "http://localhost:3000";
  const env = parseEnv(path.join(process.cwd(), ".env.local"));
  const mongoUri = env.MONGODB_URI;
  if (!mongoUri) throw new Error("MONGODB_URI missing in .env.local");

  const testId = Date.now();
  const email = `sage.e2e.${testId}@example.com`;
  const password = "StrongPass123!";
  const newPassword = "NewStrongPass123!";

  const results = [];
  const assertStep = (name, condition, detail) => {
    results.push({ name, ok: !!condition, detail });
    if (!condition) throw new Error(`FAILED: ${name} -> ${detail}`);
  };

  const post = async (route, body) => {
    const res = await fetch(`${baseUrl}${route}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }
    return { status: res.status, data };
  };

  // 1) Register
  const register = await post("/api/auth/register", {
    email,
    firstName: "E2E",
    lastName: "Tester",
    password,
    confirmPassword: password,
    role: "STUDENT",
    agreeToTerms: true,
  });
  assertStep(
    "register status 201",
    register.status === 201,
    JSON.stringify(register),
  );
  assertStep(
    "register success true",
    register.data?.success === true,
    JSON.stringify(register.data),
  );

  // 2) Duplicate register
  const duplicate = await post("/api/auth/register", {
    email,
    firstName: "E2E",
    lastName: "Tester",
    password,
    confirmPassword: password,
    role: "STUDENT",
    agreeToTerms: true,
  });
  assertStep(
    "duplicate register 409",
    duplicate.status === 409,
    JSON.stringify(duplicate),
  );

  // DB ops
  await mongoose.connect(mongoUri, { bufferCommands: false });
  const db = mongoose.connection.db;
  const users = db.collection("users");
  const verificationTokens = db.collection("emailverificationtokens");
  const resetTokens = db.collection("passwordresettokens");

  const user = await users.findOne({ email });
  assertStep("user exists in db", !!user, user ? String(user._id) : "null");

  // Force deterministic pin for testing
  const pin = "111111";
  await verificationTokens.updateOne(
    { userId: user._id },
    {
      $set: {
        pin,
        attempts: 0,
        maxAttempts: 5,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    },
    { upsert: true },
  );

  // 3) Verify PIN wrong
  const verifyWrong = await post("/api/auth/verify-pin", {
    email,
    pin: "000000",
  });
  assertStep(
    "verify wrong pin 401",
    verifyWrong.status === 401,
    JSON.stringify(verifyWrong),
  );

  // 4) Verify PIN correct
  const verifyRight = await post("/api/auth/verify-pin", { email, pin });
  assertStep(
    "verify pin success 200",
    verifyRight.status === 200,
    JSON.stringify(verifyRight),
  );
  assertStep(
    "verify pin success true",
    verifyRight.data?.success === true,
    JSON.stringify(verifyRight.data),
  );

  // 5) Resend PIN on verified user
  const resend = await post("/api/auth/resend-pin", { email });
  assertStep(
    "resend pin on verified 200",
    resend.status === 200,
    JSON.stringify(resend),
  );

  // 6) Login with original password
  const login1 = await post("/api/auth/login", { email, password });
  assertStep(
    "login success 200",
    login1.status === 200,
    JSON.stringify(login1),
  );
  assertStep(
    "login response success true",
    login1.data?.success === true,
    JSON.stringify(login1.data),
  );

  // 7) Forgot password
  const forgot = await post("/api/auth/forgot-password", { email });
  assertStep(
    "forgot password 200",
    forgot.status === 200,
    JSON.stringify(forgot),
  );

  // 8) Create deterministic reset token and reset password
  const rawToken = `known-reset-token-${testId}`;
  const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");
  await resetTokens.deleteMany({ userId: user._id });
  await resetTokens.insertOne({
    userId: user._id,
    token: hashed,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    usedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const reset = await post("/api/auth/reset-password", {
    token: rawToken,
    password: newPassword,
    confirmPassword: newPassword,
  });
  assertStep("reset password 200", reset.status === 200, JSON.stringify(reset));
  assertStep(
    "reset password success true",
    reset.data?.success === true,
    JSON.stringify(reset.data),
  );

  // 9) Login with new password
  const login2 = await post("/api/auth/login", {
    email,
    password: newPassword,
  });
  assertStep(
    "login with new password 200",
    login2.status === 200,
    JSON.stringify(login2),
  );

  // Cleanup
  await verificationTokens.deleteMany({ userId: user._id });
  await resetTokens.deleteMany({ userId: user._id });
  await users.deleteOne({ _id: user._id });
  await mongoose.disconnect();

  console.log("\nE2E AUTH ENDPOINT CHECK RESULTS");
  for (const r of results) {
    console.log(`- ${r.ok ? "PASS" : "FAIL"}: ${r.name}`);
  }
  console.log(`\nTest account used: ${email}`);
  console.log("ALL AUTH ENDPOINTS VERIFIED END-TO-END ✅");
})().catch(async (err) => {
  try {
    await mongoose.disconnect();
  } catch {}
  console.error("\nAUTH E2E FAILED ❌");
  console.error(err?.message || err);
  process.exit(1);
});
