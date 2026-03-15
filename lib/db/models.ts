// lib/db/models.ts
import mongoose, { Schema, Document, Model, Types } from "mongoose";

// ─────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────

export enum Role {
  STUDENT = "STUDENT",
  ADVISOR = "ADVISOR",
  ADMIN = "ADMIN",
}

export enum AccountStatus {
  ACTIVE = "ACTIVE",
  PENDING_VERIFICATION = "PENDING_VERIFICATION",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
}

// ─────────────────────────────────────────────
// User Model
// ─────────────────────────────────────────────

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  status: AccountStatus;
  isEmailVerified: boolean;
  emailVerifiedAt?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.STUDENT,
    },
    status: {
      type: String,
      enum: Object.values(AccountStatus),
      default: AccountStatus.PENDING_VERIFICATION,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifiedAt: Date,
    lastLoginAt: Date,
  },
  {
    timestamps: true,
  },
);

userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ createdAt: -1 });

// ─────────────────────────────────────────────
// Email Verification Token Model
// ─────────────────────────────────────────────

export interface IEmailVerificationToken extends Document {
  userId: Types.ObjectId;
  pin: string;
  attempts: number;
  maxAttempts: number;
  expiresAt: Date;
  createdAt: Date;
}

const emailVerificationTokenSchema = new Schema<IEmailVerificationToken>(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    pin: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: true,
  },
);

// ─────────────────────────────────────────────
// Password Reset Token Model
// ─────────────────────────────────────────────

export interface IPasswordResetToken extends Document {
  userId: Types.ObjectId;
  token: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
}

const passwordResetTokenSchema = new Schema<IPasswordResetToken>(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
    usedAt: Date,
  },
  {
    timestamps: true,
  },
);

// ─────────────────────────────────────────────
// Session Model (for Auth.js)
// ─────────────────────────────────────────────

export interface ISession extends Document {
  sessionToken: string;
  userId: Types.ObjectId;
  expires: Date;
  createdAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    sessionToken: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    expires: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: true,
  },
);

// ─────────────────────────────────────────────
// Account Model (for Auth.js OAuth)
// ─────────────────────────────────────────────

export interface IAccount extends Document {
  userId: Types.ObjectId;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
}

const accountSchema = new Schema<IAccount>(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: String,
    provider: String,
    providerAccountId: String,
    refresh_token: String,
    access_token: String,
    expires_at: Number,
    token_type: String,
    scope: String,
    id_token: String,
    session_state: String,
  },
  {
    timestamps: true,
  },
);

accountSchema.index({ userId: 1, provider: 1, providerAccountId: 1 });

// ─────────────────────────────────────────────
// Student Profile Model
// ─────────────────────────────────────────────

export interface IStudentProfile extends Document {
  userId: Types.ObjectId;
  studentId: string;
  department: string;
  program: string;
  year: number;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const studentProfileSchema = new Schema<IStudentProfile>(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    studentId: {
      type: String,
      required: true,
      unique: true,
    },
    department: String,
    program: String,
    year: Number,
    phone: String,
  },
  {
    timestamps: true,
  },
);

// ─────────────────────────────────────────────
// Chat Message Model
// ─────────────────────────────────────────────

export interface IChatMessage extends Document {
  senderId: Types.ObjectId;
  recipientId: Types.ObjectId;
  content: string;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    senderId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recipientId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    readAt: Date,
  },
  {
    timestamps: true,
  },
);

chatMessageSchema.index({ senderId: 1, recipientId: 1, createdAt: -1 });
chatMessageSchema.index({ recipientId: 1, readAt: 1, createdAt: -1 });

// ─────────────────────────────────────────────
// Advisor-Student Connection Model
// ─────────────────────────────────────────────

export enum ConnectionStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

export interface IAdvisorStudentConnection extends Document {
  advisorId: Types.ObjectId;
  studentId: Types.ObjectId;
  requestedBy: Types.ObjectId;
  status: ConnectionStatus;
  acceptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const advisorStudentConnectionSchema = new Schema<IAdvisorStudentConnection>(
  {
    advisorId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    studentId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    requestedBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ConnectionStatus),
      default: ConnectionStatus.PENDING,
      index: true,
    },
    acceptedAt: Date,
  },
  {
    timestamps: true,
  },
);

advisorStudentConnectionSchema.index(
  { advisorId: 1, studentId: 1 },
  { unique: true },
);

// ─────────────────────────────────────────────
// Model Creation
// ─────────────────────────────────────────────

export let User: Model<IUser>;
export let EmailVerificationToken: Model<IEmailVerificationToken>;
export let PasswordResetToken: Model<IPasswordResetToken>;
export let Session: Model<ISession>;
export let Account: Model<IAccount>;
export let StudentProfile: Model<IStudentProfile>;
export let ChatMessage: Model<IChatMessage>;
export let AdvisorStudentConnection: Model<IAdvisorStudentConnection>;

export function initializeModels() {
  try {
    User = mongoose.model<IUser>("User", userSchema);
  } catch {
    User = mongoose.model<IUser>("User");
  }

  try {
    EmailVerificationToken = mongoose.model<IEmailVerificationToken>(
      "EmailVerificationToken",
      emailVerificationTokenSchema,
    );
  } catch {
    EmailVerificationToken = mongoose.model<IEmailVerificationToken>(
      "EmailVerificationToken",
    );
  }

  try {
    PasswordResetToken = mongoose.model<IPasswordResetToken>(
      "PasswordResetToken",
      passwordResetTokenSchema,
    );
  } catch {
    PasswordResetToken =
      mongoose.model<IPasswordResetToken>("PasswordResetToken");
  }

  try {
    Session = mongoose.model<ISession>("Session", sessionSchema);
  } catch {
    Session = mongoose.model<ISession>("Session");
  }

  try {
    Account = mongoose.model<IAccount>("Account", accountSchema);
  } catch {
    Account = mongoose.model<IAccount>("Account");
  }

  try {
    StudentProfile = mongoose.model<IStudentProfile>(
      "StudentProfile",
      studentProfileSchema,
    );
  } catch {
    StudentProfile = mongoose.model<IStudentProfile>("StudentProfile");
  }

  try {
    ChatMessage = mongoose.model<IChatMessage>(
      "ChatMessage",
      chatMessageSchema,
    );
  } catch {
    ChatMessage = mongoose.model<IChatMessage>("ChatMessage");
  }

  try {
    AdvisorStudentConnection = mongoose.model<IAdvisorStudentConnection>(
      "AdvisorStudentConnection",
      advisorStudentConnectionSchema,
    );
  } catch {
    AdvisorStudentConnection = mongoose.model<IAdvisorStudentConnection>(
      "AdvisorStudentConnection",
    );
  }
}
