"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AdminDataView } from "@/components/dashboard/admin/admin-data-view";
import {
  useAdminNotifications,
  useDispatchNotification,
} from "@/hooks/use-admin";
import { useAdminStore } from "@/stores/admin-store";

interface NotificationTemplateRow {
  id: string;
  title: string;
  audience: string;
  channel: string;
}

export default function AdminNotificationsPage() {
  const { notificationAudience, setNotificationAudience } = useAdminStore();
  const { data, isLoading, error } = useAdminNotifications();
  const dispatchNotification = useDispatchNotification();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = () => {
    dispatchNotification.mutate(
      {
        title,
        message,
        audience: notificationAudience,
      },
      {
        onSuccess: () => {
          setTitle("");
          setMessage("");
        },
      },
    );
  };

  return (
    <AdminDataView<NotificationTemplateRow>
      title="Notifications & Campaigns"
      summary="Design and dispatch role-targeted communications with reusable templates and delivery governance."
      loading={isLoading}
      error={error instanceof Error ? error.message : undefined}
      metrics={data?.metrics}
      items={data?.templates ?? []}
      columns={[
        { key: "title", label: "Template", render: (row) => row.title },
        { key: "audience", label: "Audience", render: (row) => row.audience },
        { key: "channel", label: "Channel", render: (row) => row.channel },
      ]}
      emptyTitle="No templates available"
      emptyMessage="Create or seed templates to manage campaign communication workflows."
      actions={
        <div className="bg-background border-2 border-foreground rounded-2xl p-3 sm:p-4 w-full lg:w-105 space-y-3">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Campaign title"
            className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
          />
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Message content"
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-foreground/20 bg-background text-sm resize-none"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={notificationAudience}
              onChange={(event) =>
                setNotificationAudience(
                  event.target.value as typeof notificationAudience,
                )
              }
              className="h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
            >
              <option value="ALL">All users</option>
              <option value="STUDENT">Students</option>
              <option value="ADVISOR">Advisors</option>
              <option value="ADMIN">Admins</option>
            </select>
            <Button
              onClick={onSubmit}
              disabled={
                dispatchNotification.isPending ||
                title.trim().length === 0 ||
                message.trim().length === 0
              }
            >
              {dispatchNotification.isPending ? "Sending..." : "Send"}
            </Button>
          </div>
        </div>
      }
    />
  );
}
