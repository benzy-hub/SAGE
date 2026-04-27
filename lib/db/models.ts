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
  PENDING_APPROVAL = "PENDING_APPROVAL",
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
  college: string;
  department: string;
  program: string;
  level: string;
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
    college: String,
    department: String,
    program: String,
    level: String,
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

export enum AppointmentStatus {
  REQUESTED = "REQUESTED",
  CONFIRMED = "CONFIRMED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
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

export interface IAppointment extends Document {
  advisorId: Types.ObjectId;
  studentId: Types.ObjectId;
  requestedBy: Types.ObjectId;
  scheduledFor: Date;
  agenda?: string;
  notes?: string;
  status: AppointmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
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
    scheduledFor: {
      type: Date,
      required: true,
      index: true,
    },
    agenda: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: Object.values(AppointmentStatus),
      default: AppointmentStatus.REQUESTED,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

appointmentSchema.index({ advisorId: 1, scheduledFor: -1 });
appointmentSchema.index({ studentId: 1, scheduledFor: -1 });

export interface ICaseNote extends Document {
  advisorId: Types.ObjectId;
  studentId: Types.ObjectId;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const caseNoteSchema = new Schema<ICaseNote>(
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
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

caseNoteSchema.index({ advisorId: 1, studentId: 1, createdAt: -1 });

export interface IStudentAcademicPlanItem extends Document {
  studentId: Types.ObjectId;
  createdByRole: Role;
  title: string;
  term: string;
  targetDate?: Date;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  notes?: string;
  advisorGuidance?: string;
  createdAt: Date;
  updatedAt: Date;
}

const studentAcademicPlanItemSchema = new Schema<IStudentAcademicPlanItem>(
  {
    studentId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    createdByRole: {
      type: String,
      enum: [Role.STUDENT, Role.ADVISOR, Role.ADMIN],
      default: Role.STUDENT,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
    },
    term: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    targetDate: Date,
    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "DONE"],
      default: "TODO",
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 3000,
    },
    advisorGuidance: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
  },
);

studentAcademicPlanItemSchema.index({ studentId: 1, updatedAt: -1 });

export interface IPlatformSetting extends Document {
  key: string;
  value: {
    allowRegistration: boolean;
    maintenanceMode: boolean;
    supportEmail: string;
    defaultStudentYear: number;
    maxMessageLength: number;
    notifyAdminsOnNewUser: boolean;
  };
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICollegeCatalog extends Document {
  name: string;
  code: string;
  levels: string[];
  createdAt: Date;
  updatedAt: Date;
}

const collegeCatalogSchema = new Schema<ICollegeCatalog>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    levels: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export interface IDepartmentCatalog extends Document {
  college: string;
  name: string;
  levels: string[];
  createdAt: Date;
  updatedAt: Date;
}

const departmentCatalogSchema = new Schema<IDepartmentCatalog>(
  {
    college: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    levels: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

departmentCatalogSchema.index({ college: 1, name: 1 }, { unique: true });

const platformSettingSchema = new Schema<IPlatformSetting>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    value: {
      allowRegistration: { type: Boolean, default: true },
      maintenanceMode: { type: Boolean, default: false },
      supportEmail: { type: String, default: "support@sage.local" },
      defaultStudentYear: { type: Number, default: 1 },
      maxMessageLength: { type: Number, default: 2000 },
      notifyAdminsOnNewUser: { type: Boolean, default: true },
    },
    updatedBy: {
      type: Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

// ─────────────────────────────────────────────
// Advisor Availability Model
// ─────────────────────────────────────────────

export interface IAdvisorAvailability extends Document {
  advisorId: Types.ObjectId;
  dayOfWeek: number; // 0=Sun, 1=Mon ... 6=Sat
  startTime: string; // "09:00"
  endTime: string; // "10:00"
  isRecurring: boolean;
  specificDate?: Date; // for one-off slots
  isBooked: boolean;
  bookedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const advisorAvailabilitySchema = new Schema<IAdvisorAvailability>(
  {
    advisorId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    dayOfWeek: { type: Number, min: 0, max: 6 },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
    isRecurring: { type: Boolean, default: true },
    specificDate: Date,
    isBooked: { type: Boolean, default: false, index: true },
    bookedBy: { type: Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

advisorAvailabilitySchema.index({ advisorId: 1, dayOfWeek: 1, isBooked: 1 });

// ─────────────────────────────────────────────
// Advisor Rating Model
// ─────────────────────────────────────────────

export interface IAdvisorRating extends Document {
  advisorId: Types.ObjectId;
  studentId: Types.ObjectId;
  appointmentId: Types.ObjectId;
  rating: number; // 1-5
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

const advisorRatingSchema = new Schema<IAdvisorRating>(
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
    appointmentId: {
      type: Types.ObjectId,
      ref: "Appointment",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true },
);

advisorRatingSchema.index(
  { advisorId: 1, studentId: 1, appointmentId: 1 },
  { unique: true },
);

// ─────────────────────────────────────────────
// Testimonial Model
// ─────────────────────────────────────────────

export interface ITestimonial extends Document {
  authorId: Types.ObjectId;
  authorRole: Role;
  authorName: string;
  authorTitle?: string;
  quote: string;
  rating: number; // 1-5
  isApproved: boolean;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const testimonialSchema = new Schema<ITestimonial>(
  {
    authorId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    authorRole: {
      type: String,
      enum: Object.values(Role),
      required: true,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    authorTitle: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    quote: {
      type: String,
      required: true,
      trim: true,
      maxlength: 600,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 5,
    },
    isApproved: { type: Boolean, default: false, index: true },
    isPublished: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

testimonialSchema.index({ isApproved: 1, isPublished: 1, createdAt: -1 });

// ─────────────────────────────────────────────
// Contact Submission Model
// ─────────────────────────────────────────────

export interface IContactSubmission extends Document {
  name: string;
  email: string;
  message: string;
  type: "say-hi" | "get-quote";
  quoteCategory?: string;
  quoteText?: string;
  emailDelivered?: boolean;
  organization?: string;
  phone?: string;
  budget?: string;
  status?: "OPEN" | "REVIEWED" | "RESOLVED" | "ESCALATED";
  resolutionNote?: string;
  resolvedAt?: Date;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const contactSubmissionSchema = new Schema<IContactSubmission>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    message: { type: String, required: true, trim: true, maxlength: 3000 },
    type: {
      type: String,
      enum: ["say-hi", "get-quote"],
      default: "say-hi",
    },
    quoteCategory: { type: String, trim: true, maxlength: 80 },
    quoteText: { type: String, trim: true, maxlength: 1000 },
    emailDelivered: { type: Boolean, default: false },
    organization: { type: String, trim: true, maxlength: 200 },
    phone: { type: String, trim: true, maxlength: 30 },
    budget: { type: String, trim: true, maxlength: 100 },
    status: {
      type: String,
      enum: ["OPEN", "REVIEWED", "RESOLVED", "ESCALATED"],
      default: "OPEN",
    },
    resolutionNote: { type: String, trim: true, maxlength: 3000 },
    resolvedAt: { type: Date },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

contactSubmissionSchema.index({ createdAt: -1, isRead: 1 });

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
export let Appointment: Model<IAppointment>;
export let CaseNote: Model<ICaseNote>;
export let StudentAcademicPlanItem: Model<IStudentAcademicPlanItem>;
export let PlatformSetting: Model<IPlatformSetting>;
export let CollegeCatalog: Model<ICollegeCatalog>;
export let DepartmentCatalog: Model<IDepartmentCatalog>;
export let AdvisorAvailability: Model<IAdvisorAvailability>;
export let AdvisorRating: Model<IAdvisorRating>;
export let Testimonial: Model<ITestimonial>;
export let ContactSubmission: Model<IContactSubmission>;

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

  try {
    Appointment = mongoose.model<IAppointment>(
      "Appointment",
      appointmentSchema,
    );
  } catch {
    Appointment = mongoose.model<IAppointment>("Appointment");
  }

  try {
    CaseNote = mongoose.model<ICaseNote>("CaseNote", caseNoteSchema);
  } catch {
    CaseNote = mongoose.model<ICaseNote>("CaseNote");
  }

  try {
    StudentAcademicPlanItem = mongoose.model<IStudentAcademicPlanItem>(
      "StudentAcademicPlanItem",
      studentAcademicPlanItemSchema,
    );
  } catch {
    StudentAcademicPlanItem = mongoose.model<IStudentAcademicPlanItem>(
      "StudentAcademicPlanItem",
    );
  }

  try {
    PlatformSetting = mongoose.model<IPlatformSetting>(
      "PlatformSetting",
      platformSettingSchema,
    );
  } catch {
    PlatformSetting = mongoose.model<IPlatformSetting>("PlatformSetting");
  }

  try {
    CollegeCatalog = mongoose.model<ICollegeCatalog>(
      "CollegeCatalog",
      collegeCatalogSchema,
    );
  } catch {
    CollegeCatalog = mongoose.model<ICollegeCatalog>("CollegeCatalog");
  }

  try {
    DepartmentCatalog = mongoose.model<IDepartmentCatalog>(
      "DepartmentCatalog",
      departmentCatalogSchema,
    );
  } catch {
    DepartmentCatalog = mongoose.model<IDepartmentCatalog>("DepartmentCatalog");
  }

  try {
    AdvisorAvailability = mongoose.model<IAdvisorAvailability>(
      "AdvisorAvailability",
      advisorAvailabilitySchema,
    );
  } catch {
    AdvisorAvailability = mongoose.model<IAdvisorAvailability>(
      "AdvisorAvailability",
    );
  }

  try {
    AdvisorRating = mongoose.model<IAdvisorRating>(
      "AdvisorRating",
      advisorRatingSchema,
    );
  } catch {
    AdvisorRating = mongoose.model<IAdvisorRating>("AdvisorRating");
  }

  try {
    Testimonial = mongoose.model<ITestimonial>(
      "Testimonial",
      testimonialSchema,
    );
  } catch {
    Testimonial = mongoose.model<ITestimonial>("Testimonial");
  }

  try {
    ContactSubmission = mongoose.model<IContactSubmission>(
      "ContactSubmission",
      contactSubmissionSchema,
    );
  } catch {
    ContactSubmission = mongoose.model<IContactSubmission>("ContactSubmission");
  }
}
