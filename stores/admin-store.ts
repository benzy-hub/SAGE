import { create } from "zustand";

type RoleFilter = "ALL" | "STUDENT" | "ADVISOR" | "ADMIN";
type StatusFilter =
  | "ALL"
  | "ACTIVE"
  | "PENDING_VERIFICATION"
  | "INACTIVE"
  | "SUSPENDED";

type AdminStore = {
  search: string;
  roleFilter: RoleFilter;
  statusFilter: StatusFilter;
  page: number;
  notificationAudience: "ALL" | "STUDENT" | "ADVISOR" | "ADMIN";
  setSearch: (value: string) => void;
  setRoleFilter: (value: RoleFilter) => void;
  setStatusFilter: (value: StatusFilter) => void;
  setPage: (value: number) => void;
  setNotificationAudience: (
    value: "ALL" | "STUDENT" | "ADVISOR" | "ADMIN",
  ) => void;
  resetUserFilters: () => void;
};

export const useAdminStore = create<AdminStore>((set) => ({
  search: "",
  roleFilter: "ALL",
  statusFilter: "ALL",
  page: 1,
  notificationAudience: "ALL",
  setSearch: (value) => set({ search: value, page: 1 }),
  setRoleFilter: (value) => set({ roleFilter: value, page: 1 }),
  setStatusFilter: (value) => set({ statusFilter: value, page: 1 }),
  setPage: (value) => set({ page: value }),
  setNotificationAudience: (value) => set({ notificationAudience: value }),
  resetUserFilters: () =>
    set({
      search: "",
      roleFilter: "ALL",
      statusFilter: "ALL",
      page: 1,
    }),
}));
