"use client";

interface MessageSkeletonProps {
  isOwn?: boolean;
}

export function MessageSkeleton({ isOwn = false }: MessageSkeletonProps) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} gap-2`}>
      <div
        className={`w-32 h-10 rounded-2xl ${isOwn ? "rounded-br-none" : "rounded-bl-none"} skeleton-loading`}
      />
    </div>
  );
}

export function ContactListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border-2 border-foreground/10 p-3 space-y-2"
        >
          <div className="h-4 w-3/4 skeleton-loading rounded-lg" />
          <div className="h-3 w-1/2 skeleton-loading rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function ChatHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-foreground/10">
      <div className="space-y-1">
        <div className="h-4 w-32 skeleton-loading rounded-lg" />
        <div className="h-3 w-24 skeleton-loading rounded-lg" />
      </div>
    </div>
  );
}
