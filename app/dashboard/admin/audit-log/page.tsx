"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText, FileType2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { AdminDataView } from "@/components/dashboard/admin/admin-data-view";
import { useAdminAuditLog } from "@/hooks/use-admin";

interface AuditRow {
  id: string;
  category: string;
  action: string;
  actor: string;
  occurredAt: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
}

export default function AdminAuditLogPage() {
  const { data, isLoading, error } = useAdminAuditLog();
  const [exporting, setExporting] = useState(false);
  const rows = data?.items ?? [];

  const downloadFile = (content: BlobPart, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    if (!rows.length) return;
    setExporting(true);
    try {
      const headers = [
        "ID",
        "Category",
        "Action",
        "Actor",
        "Severity",
        "Occurred At",
      ];
      const csvRows = rows.map((row) => [
        row.id,
        row.category,
        row.action,
        row.actor,
        row.severity,
        new Date(row.occurredAt).toLocaleString(),
      ]);

      const csv = [
        headers.join(","),
        ...csvRows.map((row) =>
          row
            .map((cell) =>
              typeof cell === "string" &&
              (cell.includes(",") || cell.includes('"'))
                ? `"${cell.replace(/"/g, '""')}"`
                : cell,
            )
            .join(","),
        ),
      ].join("\n");

      downloadFile(
        csv,
        `audit-log-${new Date().toISOString().split("T")[0]}.csv`,
        "text/csv;charset=utf-8;",
      );
      toast.success("Audit log exported as CSV");
    } catch (err) {
      toast.error("Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };

  const exportToXLSX = async () => {
    if (!rows.length) return;
    setExporting(true);
    try {
      const [{ utils, writeFile }] = await Promise.all([import("xlsx")]);
      const worksheet = utils.json_to_sheet(
        rows.map((row) => ({
          ID: row.id,
          Category: row.category,
          Action: row.action,
          Actor: row.actor,
          Severity: row.severity,
          "Occurred At": new Date(row.occurredAt).toLocaleString(),
        })),
      );
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, "Audit Log");
      writeFile(
        workbook,
        `audit-log-${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      toast.success("Audit log exported as XLSX");
    } catch (err) {
      toast.error("Failed to export XLSX");
    } finally {
      setExporting(false);
    }
  };

  const exportToPDF = async () => {
    if (!rows.length) return;
    setExporting(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "landscape" });
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 16;

      doc.setFontSize(18);
      doc.text("SAGE Audit Log", 14, y);
      y += 8;
      doc.setFontSize(10);
      doc.text(
        `Exported ${new Date().toLocaleString()} · Total records: ${rows.length}`,
        14,
        y,
      );
      y += 10;

      const columns = [
        "Category",
        "Action",
        "Actor",
        "Severity",
        "Occurred At",
      ];
      const columnWidths = [34, 72, 42, 22, 48];
      const rowHeight = 7;

      const drawRow = (values: string[], isHeader = false) => {
        let x = 14;
        doc.setFontSize(isHeader ? 10 : 9);
        doc.setFont("helvetica", isHeader ? "bold" : "normal");
        values.forEach((value, index) => {
          const width = columnWidths[index];
          const text = doc.splitTextToSize(value, width - 2);
          doc.rect(x, y - 4, width, rowHeight, "S");
          doc.text(text, x + 1, y);
          x += width;
        });
        y += rowHeight;
      };

      drawRow(columns, true);

      rows.forEach((row) => {
        if (y > 185) {
          doc.addPage();
          y = 16;
          drawRow(columns, true);
        }
        drawRow([
          row.category,
          row.action,
          row.actor,
          row.severity,
          new Date(row.occurredAt).toLocaleString(),
        ]);
      });

      doc.save(`audit-log-${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("Audit log exported as PDF");
    } catch (err) {
      toast.error("Failed to export PDF");
    } finally {
      setExporting(false);
    }
  };

  const severityBadgeClass = (severity: string) => {
    switch (severity) {
      case "HIGH":
        return "bg-red-100 text-red-700";
      case "MEDIUM":
        return "bg-amber-100 text-amber-700";
      case "LOW":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <AdminDataView<AuditRow>
      title="Audit Log"
      summary="Review operational and security events with actor attribution, severity levels, and event chronology."
      loading={isLoading}
      error={error instanceof Error ? error.message : undefined}
      metrics={data?.metrics}
      items={rows}
      columns={[
        { key: "category", label: "Category", render: (row) => row.category },
        { key: "action", label: "Action", render: (row) => row.action },
        { key: "actor", label: "Actor", render: (row) => row.actor },
        {
          key: "severity",
          label: "Severity",
          render: (row) => (
            <span
              className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${severityBadgeClass(row.severity)}`}
            >
              {row.severity}
            </span>
          ),
        },
        {
          key: "occurredAt",
          label: "Occurred",
          render: (row) => new Date(row.occurredAt).toLocaleString(),
        },
      ]}
      emptyTitle="No audit events"
      emptyMessage="Audit entries will populate as administrative and user actions occur."
      actions={
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={!rows.length || exporting}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {exporting ? "Exporting..." : "Export"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToCSV} disabled={exporting}>
                <FileText className="w-4 h-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToXLSX} disabled={exporting}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export as XLSX
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={exportToPDF} disabled={exporting}>
                <FileType2 className="w-4 h-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    />
  );
}
