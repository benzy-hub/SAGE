"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { AdminDataView } from "@/components/dashboard/admin/admin-data-view";
import { useAdminSettings, useSaveAdminSettings } from "@/hooks/use-admin";

interface SettingsRow {
  key: string;
  allowRegistration: string;
  maintenanceMode: string;
  supportEmail: string;
  defaultStudentYear: number;
  maxMessageLength: number;
  notifyAdminsOnNewUser: string;
  updatedAt: string;
}

export default function AdminSettingsPage() {
  const { data, isLoading, error } = useAdminSettings();
  const saveSettings = useSaveAdminSettings();

  const allowRegistrationRef = useRef<HTMLInputElement>(null);
  const maintenanceModeRef = useRef<HTMLInputElement>(null);
  const supportEmailRef = useRef<HTMLInputElement>(null);
  const defaultStudentYearRef = useRef<HTMLInputElement>(null);
  const maxMessageLengthRef = useRef<HTMLInputElement>(null);
  const notifyAdminsOnNewUserRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const item = data?.item;
    saveSettings.mutate({
      allowRegistration:
        allowRegistrationRef.current?.checked ??
        Boolean(item?.allowRegistration),
      maintenanceMode:
        maintenanceModeRef.current?.checked ?? Boolean(item?.maintenanceMode),
      supportEmail:
        supportEmailRef.current?.value?.trim() ||
        String(item?.supportEmail ?? "support@sage.local"),
      defaultStudentYear: Number(
        defaultStudentYearRef.current?.value ?? item?.defaultStudentYear ?? 1,
      ),
      maxMessageLength: Number(
        maxMessageLengthRef.current?.value ?? item?.maxMessageLength ?? 2000,
      ),
      notifyAdminsOnNewUser:
        notifyAdminsOnNewUserRef.current?.checked ??
        Boolean(item?.notifyAdminsOnNewUser),
    });
  };

  const item = data?.item;
  const rows: SettingsRow[] = item
    ? [
        {
          key: item.key,
          allowRegistration: item.allowRegistration ? "Enabled" : "Disabled",
          maintenanceMode: item.maintenanceMode ? "Enabled" : "Disabled",
          supportEmail: item.supportEmail,
          defaultStudentYear: item.defaultStudentYear,
          maxMessageLength: item.maxMessageLength,
          notifyAdminsOnNewUser: item.notifyAdminsOnNewUser
            ? "Enabled"
            : "Disabled",
          updatedAt: item.updatedAt,
        },
      ]
    : [];

  return (
    <AdminDataView<SettingsRow>
      title="Platform Settings"
      summary="Manage platform-wide registration, communication, and operational defaults with validated configuration updates."
      loading={isLoading}
      error={error instanceof Error ? error.message : undefined}
      metrics={{
        editableFields: 6,
        defaultStudentYear: item?.defaultStudentYear ?? 1,
        maxMessageLength: item?.maxMessageLength ?? 2000,
      }}
      items={rows}
      columns={[
        { key: "key", label: "Setting Key", render: (row) => row.key },
        {
          key: "allowRegistration",
          label: "Registration",
          render: (row) => row.allowRegistration,
        },
        {
          key: "maintenanceMode",
          label: "Maintenance",
          render: (row) => row.maintenanceMode,
        },
        {
          key: "supportEmail",
          label: "Support Email",
          render: (row) => row.supportEmail,
        },
        {
          key: "updatedAt",
          label: "Updated",
          render: (row) => new Date(row.updatedAt).toLocaleString(),
        },
      ]}
      emptyTitle="No settings record"
      emptyMessage="The platform settings record is created automatically on first load."
      actions={
        <div
          key={item?.updatedAt ?? "settings-form"}
          className="bg-background border-2 border-foreground rounded-2xl p-3 sm:p-4 w-full lg:w-105 space-y-3"
        >
          <label className="flex items-center justify-between text-sm">
            <span>Allow registration</span>
            <input
              ref={allowRegistrationRef}
              type="checkbox"
              defaultChecked={Boolean(item?.allowRegistration)}
            />
          </label>
          <label className="flex items-center justify-between text-sm">
            <span>Maintenance mode</span>
            <input
              ref={maintenanceModeRef}
              type="checkbox"
              defaultChecked={Boolean(item?.maintenanceMode)}
            />
          </label>
          <label className="block text-sm">
            <span className="block mb-1">Support email</span>
            <input
              ref={supportEmailRef}
              defaultValue={item?.supportEmail ?? "support@sage.local"}
              className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-sm">
              <span className="block mb-1">Default year</span>
              <input
                ref={defaultStudentYearRef}
                type="number"
                min={1}
                max={8}
                defaultValue={item?.defaultStudentYear ?? 1}
                className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="block mb-1">Max message length</span>
              <input
                ref={maxMessageLengthRef}
                type="number"
                min={100}
                max={5000}
                defaultValue={item?.maxMessageLength ?? 2000}
                className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
              />
            </label>
          </div>
          <label className="flex items-center justify-between text-sm">
            <span>Notify admins on new user</span>
            <input
              ref={notifyAdminsOnNewUserRef}
              type="checkbox"
              defaultChecked={Boolean(item?.notifyAdminsOnNewUser)}
            />
          </label>
          <Button
            onClick={submit}
            disabled={saveSettings.isPending}
            className="w-full"
          >
            {saveSettings.isPending ? "Saving..." : "Save settings"}
          </Button>
        </div>
      }
    />
  );
}
