"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type MetricMap = Record<string, string | number>;

type Column<T> = {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
};

interface AdminDataViewProps<T> {
  title: string;
  summary: string;
  loading: boolean;
  error?: string;
  metrics?: MetricMap;
  items: T[];
  columns: Column<T>[];
  emptyTitle: string;
  emptyMessage: string;
  actions?: React.ReactNode;
  rowKey?: (row: T, index: number) => string;
  clientPagination?: boolean;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  showRowNumber?: boolean;
  tableTourId?: string;
}

export function AdminDataView<T>({
  title,
  summary,
  loading,
  error,
  metrics,
  items,
  columns,
  emptyTitle,
  emptyMessage,
  actions,
  rowKey,
  clientPagination = true,
  defaultPageSize = 10,
  pageSizeOptions = [10, 20, 50],
  showRowNumber = true,
  tableTourId,
}: AdminDataViewProps<T>) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const sanitizedPageSizeOptions = useMemo(
    () => Array.from(new Set(pageSizeOptions)).filter((size) => size > 0),
    [pageSizeOptions],
  );

  const totalPages = clientPagination
    ? Math.max(1, Math.ceil(items.length / pageSize))
    : 1;
  const currentPage = Math.min(page, totalPages);

  const visibleItems = useMemo(() => {
    if (!clientPagination) return items;
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [clientPagination, currentPage, items, pageSize]);

  const serialStart = clientPagination ? (currentPage - 1) * pageSize + 1 : 1;

  return (
    <section className="bg-secondary border-2 border-foreground rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 lg:p-8">
      <div className="grid xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.9fr)] gap-4 sm:gap-6 xl:items-start">
        <div className="min-w-0">
          <div className="sage-section-chip self-start inline-flex">
            <span className="text-xl sm:text-2xl font-medium text-primary-foreground">
              {title}
            </span>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground mt-3 max-w-4xl leading-relaxed">
            {summary}
          </p>
        </div>
        {actions ? <div className="w-full xl:min-w-[360px]">{actions}</div> : null}
      </div>

      {metrics ? (
        <div className="mt-6 grid sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
          {Object.entries(metrics).map(([key, value]) => (
            <article
              key={key}
              className="bg-background border-2 border-foreground rounded-2xl p-4"
            >
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </p>
              <p className="text-2xl font-bold text-foreground mt-2">{value}</p>
            </article>
          ))}
        </div>
      ) : null}

      {error ? (
        <div className="mt-5 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div
        className="mt-5 overflow-x-auto rounded-2xl border-2 border-foreground bg-background"
        data-tour={tableTourId}
      >
        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-base font-semibold text-foreground">
              {emptyTitle}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{emptyMessage}</p>
          </div>
        ) : (
          <table className="w-full min-w-[980px] xl:min-w-full">
            <thead>
              <tr className="border-b border-foreground/10">
                {showRowNumber ? (
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    S/N
                  </th>
                ) : null}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleItems.map((item, index) => (
                <tr
                  key={rowKey ? rowKey(item, index) : index}
                  className="border-b border-foreground/10 last:border-none"
                >
                  {showRowNumber ? (
                    <td className="px-4 py-3 text-sm text-muted-foreground font-medium whitespace-nowrap">
                      {serialStart + index}
                    </td>
                  ) : null}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-3 text-sm text-foreground"
                    >
                      {column.render(item)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {clientPagination && !loading && items.length > 0 ? (
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, items.length)} of {items.length}
          </p>
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
              className="h-9 px-2 rounded-md border border-foreground/20 bg-background text-sm"
            >
              {sanitizedPageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}/page
                </option>
              ))}
            </select>
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Prev
            </Button>
            <span className="text-xs text-muted-foreground px-1">
              {currentPage}/{totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
