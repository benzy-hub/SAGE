export type NotificationAudience = "ALL" | "STUDENT" | "ADVISOR" | "ADMIN";

export interface AdminMetricMap {
  [key: string]: string | number;
}

export interface AdminRecentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface AdminOverviewResponse {
  metrics: AdminMetricMap;
  recentUsers: AdminRecentUser[];
}

export interface AdminUsersItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  studentId: string | null;
  college: string | null;
  department: string | null;
  program: string | null;
  level: string | null;
  year: number | null;
  isEmailVerified: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface AdminUsersResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  items: AdminUsersItem[];
}

export interface AdminAdvisorItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  createdAt: string;
  activeAdvisees: number;
  pendingRequests: number;
}

export interface AdminAdvisorsResponse {
  metrics: AdminMetricMap;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  items: AdminAdvisorItem[];
}

export interface AdminDepartmentItem {
  id: string;
  college: string;
  name: string;
  studentCount: number;
  programCount: number;
  levels: string[];
  avgYear: number;
  advisorSlots: number;
  managed?: boolean;
}

export interface AdminDepartmentsResponse {
  metrics: AdminMetricMap;
  items: AdminDepartmentItem[];
}

export interface AdminCollegeItem {
  id: string;
  name: string;
  code: string;
  studentCount: number;
  departmentCount: number;
  levels: string[];
  avgYear: number;
  managed?: boolean;
}

export interface AdminCollegesResponse {
  metrics: AdminMetricMap;
  items: AdminCollegeItem[];
}

export interface AdminStudentItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  studentId: string;
  college: string;
  department: string;
  program: string;
  level: string;
  year: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStudentsResponse {
  metrics: AdminMetricMap;
  items: AdminStudentItem[];
}

export interface AdminAppointmentItem {
  id: string;
  advisorName: string;
  advisorEmail: string;
  studentName: string;
  studentEmail: string;
  requestedBy: string;
  scheduledFor: string;
  agenda: string;
  notes: string;
  status: string;
  channel: string;
  updatedAt: string;
}

export interface AdminAppointmentsResponse {
  metrics: AdminMetricMap;
  items: AdminAppointmentItem[];
}

export interface AdminNotificationTemplate {
  id: string;
  title: string;
  audience: string;
  channel: string;
}

export interface AdminNotificationsResponse {
  metrics: AdminMetricMap;
  templates: AdminNotificationTemplate[];
}

export interface AdminNotificationDispatchResponse {
  success: boolean;
  dispatch: {
    id: string;
    title: string;
    message: string;
    audience: NotificationAudience;
    sentBy: string;
    createdAt: string;
  };
}

export interface AdminReportsResponse {
  kpis: {
    totalUsers: number;
    activeRate: number;
    reportingWindowMonths: number;
    latestMonthTotal: number;
  };
  trend: Array<{
    month: string;
    students: number;
    advisors: number;
    admins: number;
    total: number;
  }>;
}

export interface AdminIntegrationItem {
  id: string;
  name: string;
  status: string;
  note: string;
  successRate?: number;
}

export interface AdminAuditItem {
  id: string;
  category: string;
  action: string;
  actor: string;
  occurredAt: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
}

export interface AdminAuditResponse {
  metrics: AdminMetricMap;
  items: AdminAuditItem[];
}

export interface AdminSupportItem {
  id: string;
  issue: string;
  priority: string;
  owner: string;
  email: string;
  details?: string;
  openedAt: string;
  status: string;
}

export interface AdminSupportResponse {
  metrics: AdminMetricMap;
  items: AdminSupportItem[];
}

export interface AdminSettingsItem {
  key: string;
  allowRegistration: boolean;
  maintenanceMode: boolean;
  supportEmail: string;
  defaultStudentYear: number;
  maxMessageLength: number;
  notifyAdminsOnNewUser: boolean;
  integrations: AdminIntegrationItem[];
  updatedAt: string;
}

export interface AdminSettingsResponse {
  item: AdminSettingsItem;
}

export interface AdminSettingsSaveResponse {
  success: boolean;
  item: AdminSettingsItem;
}

export interface AdminUserStatusUpdateResponse {
  success: boolean;
  item: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: string;
    isEmailVerified: boolean;
  };
}

export interface AdminMutationResponse {
  success: boolean;
}

export interface AdminCreateStudentInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  studentId: string;
  college: string;
  department: string;
  program: string;
  level: string;
  year: number;
}

export interface AdminCreateAdvisorInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AdminBulkStudentRow {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  studentId: string;
  college: string;
  department: string;
  program?: string;
  level: string;
  year?: number;
}

export interface AdminBulkStudentResult {
  index: number;
  email: string;
  studentId: string;
  success: boolean;
  error?: string;
  id?: string;
}

export interface AdminBulkCreateStudentsResponse {
  success: boolean;
  total: number;
  created: number;
  failed: number;
  results: AdminBulkStudentResult[];
}

export interface AdminCreateCollegeInput {
  name: string;
  code: string;
}

export interface AdminCreateDepartmentInput {
  college: string;
  name: string;
  levels: string[];
}
