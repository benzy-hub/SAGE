"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiRequest } from "@/lib/admin/http";
import type {
  AdminCreateAdvisorInput,
  AdminCreateCollegeInput,
  AdminCreateDepartmentInput,
  AdminCreateStudentInput,
  AdminBulkStudentRow,
  AdminBulkCreateStudentsResponse,
  AdminAdvisorsResponse,
  AdminAppointmentsResponse,
  AdminAuditResponse,
  AdminCollegesResponse,
  AdminDepartmentsResponse,
  AdminIntegrationsResponse,
  AdminNotificationDispatchResponse,
  AdminNotificationsResponse,
  AdminOverviewResponse,
  AdminReportsResponse,
  AdminSettingsResponse,
  AdminSettingsSaveResponse,
  AdminStudentsResponse,
  AdminSupportResponse,
  AdminMutationResponse,
  AdminUserStatusUpdateResponse,
  AdminUsersResponse,
  NotificationAudience,
} from "@/lib/admin/types";

type SaveSettingsInput = {
  allowRegistration: boolean;
  maintenanceMode: boolean;
  supportEmail: string;
  defaultStudentYear: number;
  maxMessageLength: number;
  notifyAdminsOnNewUser: boolean;
};

export function useAdminOverview() {
  return useQuery({
    queryKey: ["admin", "overview"],
    queryFn: () => apiRequest<AdminOverviewResponse>("/api/admin/overview"),
  });
}

export function useAdminUsers(params: {
  page: number;
  search: string;
  role: string;
  status: string;
}) {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: "15",
    search: params.search,
    role: params.role,
    status: params.status,
  });

  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: () =>
      apiRequest<AdminUsersResponse>(`/api/admin/users?${query.toString()}`),
  });
}

export function useAdminAdvisors(search = "") {
  const query = new URLSearchParams({ page: "1", limit: "20", search });
  return useQuery({
    queryKey: ["admin", "advisors", search],
    queryFn: () =>
      apiRequest<AdminAdvisorsResponse>(
        `/api/admin/advisors?${query.toString()}`,
      ),
  });
}

export function useAdminDepartments() {
  return useQuery({
    queryKey: ["admin", "departments"],
    queryFn: () =>
      apiRequest<AdminDepartmentsResponse>("/api/admin/departments"),
  });
}

export function useAdminColleges() {
  return useQuery({
    queryKey: ["admin", "colleges"],
    queryFn: () => apiRequest<AdminCollegesResponse>("/api/admin/colleges"),
  });
}

export function useAdminStudents() {
  return useQuery({
    queryKey: ["admin", "students"],
    queryFn: () => apiRequest<AdminStudentsResponse>("/api/admin/students"),
  });
}

export function useAdminAppointments() {
  return useQuery({
    queryKey: ["admin", "appointments"],
    queryFn: () =>
      apiRequest<AdminAppointmentsResponse>("/api/admin/appointments"),
  });
}

export function useAdminNotifications() {
  return useQuery({
    queryKey: ["admin", "notifications"],
    queryFn: () =>
      apiRequest<AdminNotificationsResponse>("/api/admin/notifications"),
  });
}

export function useAdminReports() {
  return useQuery({
    queryKey: ["admin", "reports"],
    queryFn: () => apiRequest<AdminReportsResponse>("/api/admin/reports"),
  });
}

export function useAdminIntegrations() {
  return useQuery({
    queryKey: ["admin", "integrations"],
    queryFn: () =>
      apiRequest<AdminIntegrationsResponse>("/api/admin/integrations"),
  });
}

export function useAdminAuditLog() {
  return useQuery({
    queryKey: ["admin", "audit-log"],
    queryFn: () => apiRequest<AdminAuditResponse>("/api/admin/audit-log"),
  });
}

export function useAdminSupport() {
  return useQuery({
    queryKey: ["admin", "support"],
    queryFn: () => apiRequest<AdminSupportResponse>("/api/admin/support"),
  });
}

export function useAdminSettings() {
  return useQuery({
    queryKey: ["admin", "settings"],
    queryFn: () => apiRequest<AdminSettingsResponse>("/api/admin/settings"),
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { userId: string; status: string }) =>
      apiRequest<AdminUserStatusUpdateResponse>(
        `/api/admin/users/${input.userId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: input.status }),
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
      toast.success("User status updated successfully");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    }) =>
      apiRequest<AdminMutationResponse>("/api/admin/users", {
        method: "POST",
        body: JSON.stringify({ ...input, role: "ADMIN", status: "ACTIVE" }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
      toast.success("Admin account created");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) =>
      apiRequest<AdminMutationResponse>(`/api/admin/users/${userId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "students"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "advisors"] });
      toast.success("User deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: AdminCreateStudentInput) =>
      apiRequest<AdminMutationResponse>("/api/admin/students", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "students"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
      toast.success("Student created");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      input: { userId: string } & Partial<AdminCreateStudentInput> & {
          status?: string;
        },
    ) =>
      apiRequest<AdminMutationResponse>(`/api/admin/students/${input.userId}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "students"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Student updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) =>
      apiRequest<AdminMutationResponse>(`/api/admin/students/${userId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "students"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
      toast.success("Student deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useBulkCreateStudents() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (students: AdminBulkStudentRow[]) =>
      apiRequest<AdminBulkCreateStudentsResponse>("/api/admin/students/bulk", {
        method: "POST",
        body: JSON.stringify({ students }),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "students"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
      if (data.failed === 0) {
        toast.success(`${data.created} student${data.created !== 1 ? "s" : ""} imported successfully`);
      } else {
        toast.warning(`${data.created} imported, ${data.failed} failed — check the results`);
      }
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useCreateAdvisor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: AdminCreateAdvisorInput) =>
      apiRequest<AdminMutationResponse>("/api/admin/advisors", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "advisors"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
      toast.success("Advisor created");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateAdvisor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      advisorId: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      status?: string;
    }) =>
      apiRequest<AdminMutationResponse>(
        `/api/admin/advisors/${input.advisorId}`,
        {
          method: "PATCH",
          body: JSON.stringify(input),
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "advisors"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Advisor updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteAdvisor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (advisorId: string) =>
      apiRequest<AdminMutationResponse>(`/api/admin/advisors/${advisorId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "advisors"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
      toast.success("Advisor deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useCreateCollege() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: AdminCreateCollegeInput) =>
      apiRequest<AdminMutationResponse>("/api/admin/colleges", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "colleges"] });
      toast.success("College created");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateCollege() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      name: string;
      code: string;
      levels: string[];
    }) =>
      apiRequest<AdminMutationResponse>("/api/admin/colleges", {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "colleges"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "departments"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "students"] });
      toast.success("College updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteCollege() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      apiRequest<AdminMutationResponse>("/api/admin/colleges", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "colleges"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "departments"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "students"] });
      toast.success("College deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: AdminCreateDepartmentInput) =>
      apiRequest<AdminMutationResponse>("/api/admin/departments", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "departments"] });
      toast.success("Department created");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      college: string;
      name: string;
      levels: string[];
    }) =>
      apiRequest<AdminMutationResponse>("/api/admin/departments", {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "departments"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "students"] });
      toast.success("Department updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      apiRequest<AdminMutationResponse>("/api/admin/departments", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "departments"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "students"] });
      toast.success("Department deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDispatchNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      message: string;
      audience: NotificationAudience;
    }) =>
      apiRequest<AdminNotificationDispatchResponse>(
        "/api/admin/notifications",
        {
          method: "POST",
          body: JSON.stringify(input),
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
      toast.success("Notification sent successfully");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useSaveAdminSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: SaveSettingsInput) =>
      apiRequest<AdminSettingsSaveResponse>("/api/admin/settings", {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
      toast.success("Settings saved successfully");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
