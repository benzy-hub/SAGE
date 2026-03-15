"use client";

import { io, type Socket } from "socket.io-client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Send,
  UserRound,
  Check,
  CheckCheck,
  ChevronLeft,
  Loader,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "ADVISOR" | "STUDENT";
  unreadCount: number;
  lastMessageTime?: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  readAt: string | null;
  createdAt: string;
}

interface ConnectionUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "ADVISOR" | "STUDENT";
}

interface ConnectionRequest {
  id: string;
  from?: ConnectionUser;
  target?: ConnectionUser;
}

interface MessagesClientProps {
  role: "ADVISOR" | "STUDENT";
}

export function MessagesClient({ role }: MessagesClientProps) {
  const socketRef = useRef<Socket | null>(null);
  const selectedContactRef = useRef<string>("");
  const loadedConversationForRef = useRef<string>("");

  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [availableAdvisors, setAvailableAdvisors] = useState<ConnectionUser[]>(
    [],
  );
  const [incomingRequests, setIncomingRequests] = useState<ConnectionRequest[]>(
    [],
  );
  const [outgoingRequests, setOutgoingRequests] = useState<ConnectionRequest[]>(
    [],
  );
  const [selectedContactId, setSelectedContactId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingConnections, setLoadingConnections] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [busyConnectionId, setBusyConnectionId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [mobileView, setMobileView] = useState<"contacts" | "chat">("contacts");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const selectedContact = useMemo(
    () => contacts.find((contact) => contact.id === selectedContactId) ?? null,
    [contacts, selectedContactId],
  );

  const upsertMessage = (nextMessage: ChatMessage) => {
    setMessages((prev) => {
      if (prev.some((item) => item.id === nextMessage.id)) return prev;
      return [...prev, nextMessage];
    });
  };

  const loadSession = async () => {
    const response = await fetch("/api/auth/me", { cache: "no-store" });
    const data = await response.json();
    setCurrentUserId(data?.user?.id ?? "");
  };

  const loadContacts = async (initial = false) => {
    if (initial) setLoadingContacts(true);
    try {
      const response = await fetch("/api/messages/contacts", {
        cache: "no-store",
      });
      const data = await response.json();
      const nextContacts = (data?.contacts ?? []) as ChatContact[];
      setContacts(nextContacts);

      if (!selectedContactId && nextContacts.length > 0) {
        setSelectedContactId(nextContacts[0].id);
      }

      if (
        selectedContactId &&
        nextContacts.length > 0 &&
        !nextContacts.some((contact) => contact.id === selectedContactId)
      ) {
        setSelectedContactId(nextContacts[0].id);
      }
    } catch {
      setError("Failed to load chat contacts.");
    } finally {
      if (initial) setLoadingContacts(false);
    }
  };

  const loadConnections = async (initial = false) => {
    if (initial) setLoadingConnections(true);
    try {
      const response = await fetch("/api/connections", { cache: "no-store" });
      const data = await response.json();

      setIncomingRequests(
        (data?.incomingRequests ?? []) as ConnectionRequest[],
      );
      setOutgoingRequests(
        (data?.outgoingRequests ?? []) as ConnectionRequest[],
      );
      setAvailableAdvisors((data?.availableAdvisors ?? []) as ConnectionUser[]);
    } catch {
      setError("Failed to load connection requests.");
    } finally {
      if (initial) setLoadingConnections(false);
    }
  };

  const loadMessages = async (recipientId: string, showLoader = false) => {
    if (!recipientId) return;
    if (showLoader) setLoadingMessages(true);
    try {
      const response = await fetch(`/api/messages?recipientId=${recipientId}`, {
        cache: "no-store",
      });
      const data = await response.json();
      setMessages((data?.messages ?? []) as ChatMessage[]);
      loadedConversationForRef.current = recipientId;

      await fetch("/api/messages/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: recipientId }),
      });

      setContacts((prev) =>
        prev.map((contact) =>
          contact.id === recipientId ? { ...contact, unreadCount: 0 } : contact,
        ),
      );
    } catch {
      setError("Failed to load conversation.");
    } finally {
      if (showLoader) setLoadingMessages(false);
    }
  };

  const requestConnection = async (targetId: string) => {
    setBusyConnectionId(targetId);
    setError("");
    try {
      const response = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId }),
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data?.error ?? "Failed to send connection request.");
      }
      await Promise.all([loadConnections(), loadContacts()]);
    } catch {
      setError("Failed to send connection request.");
    } finally {
      setBusyConnectionId("");
    }
  };

  const respondToRequest = async (
    connectionId: string,
    action: "accept" | "reject",
  ) => {
    setBusyConnectionId(connectionId);
    setError("");
    try {
      const response = await fetch("/api/connections/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId, action }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data?.error ?? "Failed to process connection request.");
      }

      await Promise.all([loadConnections(), loadContacts()]);
    } catch {
      setError("Failed to process connection request.");
    } finally {
      setBusyConnectionId("");
    }
  };

  useEffect(() => {
    void loadSession();
    void loadContacts(true);
    void loadConnections(true);
  }, []);

  useEffect(() => {
    selectedContactRef.current = selectedContactId;
    if (!selectedContactId) return;
    void loadMessages(
      selectedContactId,
      loadedConversationForRef.current !== selectedContactId,
    );
  }, [selectedContactId]);

  useEffect(() => {
    if (!currentUserId) return;

    const initSocket = async () => {
      await fetch("/api/socket");

      const socket = io({
        path: "/api/socket_io",
        transports: ["websocket", "polling"],
      });

      socketRef.current = socket;
      socket.emit("join", { userId: currentUserId });

      socket.on("message:new", async (incoming: ChatMessage) => {
        if (
          incoming.senderId !== currentUserId &&
          incoming.recipientId !== currentUserId
        ) {
          return;
        }

        const otherPartyId =
          incoming.senderId === currentUserId
            ? incoming.recipientId
            : incoming.senderId;

        if (selectedContactRef.current === otherPartyId) {
          upsertMessage(incoming);

          if (incoming.senderId !== currentUserId) {
            await fetch("/api/messages/mark-read", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ senderId: otherPartyId }),
            });

            setContacts((prev) =>
              prev.map((contact) =>
                contact.id === otherPartyId
                  ? { ...contact, unreadCount: 0 }
                  : contact,
              ),
            );
          }
          return;
        }

        if (incoming.senderId !== currentUserId) {
          setContacts((prev) =>
            prev.map((contact) =>
              contact.id === incoming.senderId
                ? { ...contact, unreadCount: contact.unreadCount + 1 }
                : contact,
            ),
          );
        }
      });

      socket.on("connection:updated", () => {
        void loadConnections();
        void loadContacts();
      });
    };

    void initSocket();

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [currentUserId]);

  const sendMessage = async () => {
    const content = draft.trim();
    if (!content || !selectedContactId) return;

    setSending(true);
    setError("");

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: selectedContactId, content }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data?.error ?? "Failed to send message.");
        return;
      }

      upsertMessage(data.message as ChatMessage);
      setDraft("");
    } catch {
      setError("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const onSelectContact = (contactId: string) => {
    setSelectedContactId(contactId);
    setMobileView("chat");
  };

  /* ─── Shared message bubble renderer ─────────────────────────── */
  const renderMessages = () => {
    if (loadingMessages)
      return (
        <div className="flex items-center justify-center flex-1">
          <Loader className="w-5 h-5 animate-spin text-primary" />
        </div>
      );
    if (messages.length === 0)
      return (
        <div className="flex items-center justify-center flex-1">
          <p className="text-xs text-muted-foreground text-center px-6">
            No messages yet — say hello! 👋
          </p>
        </div>
      );
    return (
      <>
        {messages.map((message) => {
          const mine = message.senderId === currentUserId;
          const isRead = message.readAt !== null;
          return (
            <div
              key={message.id}
              className={`flex ${mine ? "justify-end" : "justify-start"} message-animate`}
            >
              <div
                className={`max-w-[78%] sm:max-w-[65%] rounded-2xl px-3 py-2 wrap-break-word shadow-sm ${
                  mine
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-secondary text-foreground border border-foreground/10 rounded-bl-sm"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </p>
                <div
                  className={`flex items-center justify-end gap-1 mt-0.5 ${mine ? "text-primary-foreground/65" : "text-muted-foreground"}`}
                >
                  <span className="text-[10px]">
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {mine &&
                    (isRead ? (
                      <CheckCheck className="w-3 h-3" />
                    ) : (
                      <Check className="w-3 h-3" />
                    ))}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </>
    );
  };

  /* ─── Shared input bar renderer ──────────────────────────────── */
  const renderInput = (compact = false) => (
    <div className={`flex items-end gap-2 ${compact ? "" : ""}`}>
      <Textarea
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            void sendMessage();
          }
        }}
        rows={compact ? 1 : 2}
        placeholder={compact ? "Message…" : "Type a message…"}
        className={`resize-none border-2 border-foreground/20 bg-background focus:border-primary transition-colors scrollbar-none ${
          compact
            ? "min-h-10 rounded-2xl text-sm px-3.5 py-2.5"
            : "min-h-12 rounded-xl text-sm"
        }`}
      />
      <Button
        type="button"
        onClick={() => void sendMessage()}
        disabled={sending || !selectedContact || !draft.trim()}
        size="icon"
        className={`rounded-full bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all shrink-0 ${compact ? "h-10 w-10" : "h-11 w-11"}`}
      >
        {sending ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
      </Button>
    </div>
  );

  /* ─── Contact avatar initials ────────────────────────────────── */
  const getInitials = (c: ChatContact | null) => {
    if (!c) return "?";
    return `${c.firstName[0] ?? ""}${c.lastName[0] ?? ""}`.toUpperCase();
  };

  return (
    <>
      {/* ════════════════════════════════════════════════════════
          DESKTOP + TABLET  (≥ lg)
      ════════════════════════════════════════════════════════ */}
      <section className="hidden lg:block bg-secondary border-2 border-foreground rounded-[2rem] p-5 lg:p-7">
        <div className="flex flex-col lg:flex-row lg:items-start gap-4 mb-5">
          <div className="sage-section-chip self-start shrink-0">
            <span className="text-xl lg:text-2xl font-medium text-primary-foreground">
              {role === "ADVISOR" ? "Advisor Messages" : "Student Messages"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
            Real-time advisor-student communication for follow-ups, reminders,
            and support.
          </p>
        </div>

        {error && (
          <div className="mb-3 rounded-xl border-2 border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-[288px_minmax(0,1fr)] gap-4">
          {/* ── Sidebar ─────────────────────────────────────── */}
          <aside className="bg-background border-2 border-foreground rounded-2xl flex flex-col h-[68vh] overflow-hidden">
            <div className="px-4 pt-4 pb-3 border-b border-foreground/10">
              <p className="text-sm font-semibold text-foreground">Contacts</p>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-none p-3 space-y-1">
              {loadingContacts ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="w-4 h-4 animate-spin text-primary" />
                </div>
              ) : contacts.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No contacts yet.
                </p>
              ) : (
                contacts.map((contact) => {
                  const active = contact.id === selectedContactId;
                  return (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => setSelectedContactId(contact.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-secondary"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-foreground/10 text-foreground"}`}
                      >
                        {getInitials(contact)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {contact.firstName} {contact.lastName}
                        </p>
                        <p
                          className={`text-[11px] truncate ${active ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                        >
                          {contact.email}
                        </p>
                      </div>
                      {contact.unreadCount > 0 && (
                        <span className="inline-flex min-w-5 h-5 px-1.5 rounded-full bg-foreground text-background text-[10px] items-center justify-center font-semibold shrink-0">
                          {contact.unreadCount > 9 ? "9+" : contact.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Connection requests */}
            {!loadingConnections &&
              (incomingRequests.length > 0 || availableAdvisors.length > 0) && (
                <div className="border-t border-foreground/10 p-3 space-y-2 overflow-y-auto scrollbar-none max-h-48">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {role === "ADVISOR" ? "Requests" : "Available"}
                  </p>
                  {role === "ADVISOR" &&
                    incomingRequests.map((req) => (
                      <div
                        key={req.id}
                        className="rounded-lg bg-secondary border border-foreground/10 p-2"
                      >
                        <p className="text-xs font-medium text-foreground truncate">
                          {req.from?.firstName} {req.from?.lastName}
                        </p>
                        <div className="mt-1.5 flex gap-1">
                          <Button
                            size="sm"
                            className="h-6 flex-1 rounded-md bg-foreground text-background hover:bg-primary text-[10px]"
                            disabled={busyConnectionId === req.id}
                            onClick={() =>
                              void respondToRequest(req.id, "accept")
                            }
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 flex-1 rounded-md text-[10px]"
                            disabled={busyConnectionId === req.id}
                            onClick={() =>
                              void respondToRequest(req.id, "reject")
                            }
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  {role === "STUDENT" &&
                    availableAdvisors.slice(0, 3).map((adv) => (
                      <div
                        key={adv.id}
                        className="rounded-lg bg-secondary border border-foreground/10 p-2"
                      >
                        <p className="text-xs font-medium text-foreground truncate">
                          {adv.firstName} {adv.lastName}
                        </p>
                        <Button
                          size="sm"
                          className="h-6 mt-1.5 w-full rounded-md bg-foreground text-background hover:bg-primary text-[10px]"
                          disabled={busyConnectionId === adv.id}
                          onClick={() => void requestConnection(adv.id)}
                        >
                          Request
                        </Button>
                      </div>
                    ))}
                </div>
              )}
          </aside>

          {/* ── Chat area ───────────────────────────────────── */}
          <div className="bg-background border-2 border-foreground rounded-2xl overflow-hidden h-[68vh] flex flex-col">
            <div className="shrink-0 px-4 py-3 border-b border-foreground/10 bg-secondary/50 flex items-center gap-3">
              {selectedContact ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-xs font-bold text-foreground shrink-0">
                    {getInitials(selectedContact)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground leading-tight truncate">
                      {selectedContact.firstName} {selectedContact.lastName}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {selectedContact.email}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select a contact to start chatting
                </p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-none p-4 space-y-2.5 flex flex-col">
              {!selectedContact ? (
                <div className="flex items-center justify-center flex-1">
                  <p className="text-sm text-muted-foreground">
                    Select a contact from the sidebar
                  </p>
                </div>
              ) : (
                renderMessages()
              )}
            </div>

            <div className="shrink-0 border-t border-foreground/10 p-3 bg-background">
              {renderInput(false)}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          MOBILE  (< lg)  — contacts list (normal page flow)
      ════════════════════════════════════════════════════════ */}
      <section className="lg:hidden bg-secondary border-2 border-foreground rounded-[2rem] p-4">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="sage-section-chip self-start">
            <span className="text-lg font-medium text-primary-foreground">
              Messages
            </span>
          </div>
          {(incomingRequests.length > 0 || outgoingRequests.length > 0) && (
            <span className="inline-flex h-6 px-2 rounded-full bg-foreground text-background text-[10px] items-center font-semibold">
              {incomingRequests.length + outgoingRequests.length} pending
            </span>
          )}
        </div>

        {error && (
          <div className="mb-3 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}

        {/* ── Contact list ── */}
        {loadingContacts ? (
          <div className="bg-background rounded-2xl border-2 border-foreground/10 divide-y divide-foreground/5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-11 h-11 rounded-full skeleton-loading shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-32 skeleton-loading rounded-full" />
                  <div className="h-3 w-24 skeleton-loading rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : contacts.length === 0 ? (
          <div className="bg-background rounded-2xl border-2 border-foreground/10 px-4 py-10 text-center">
            <UserRound className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">
              No contacts yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {role === "STUDENT"
                ? "Request a connection to start chatting"
                : "Accept student requests to chat"}
            </p>
          </div>
        ) : (
          <div className="bg-background rounded-2xl border-2 border-foreground overflow-hidden divide-y divide-foreground/8">
            {contacts.map((contact) => (
              <button
                key={contact.id}
                type="button"
                onClick={() => onSelectContact(contact.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-secondary transition-colors text-left"
              >
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                  {getInitials(contact)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {contact.firstName} {contact.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {contact.email}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {contact.unreadCount > 0 ? (
                    <span className="inline-flex min-w-5 h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] items-center justify-center font-semibold">
                      {contact.unreadCount > 9 ? "9+" : contact.unreadCount}
                    </span>
                  ) : (
                    <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── Connection requests ── */}
        {!loadingConnections &&
          (incomingRequests.length > 0 || availableAdvisors.length > 0) && (
            <div className="mt-4 pt-4 border-t border-foreground/10">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                {role === "ADVISOR"
                  ? "Incoming Requests"
                  : "Available Advisors"}
              </p>
              <div className="space-y-2">
                {role === "ADVISOR" &&
                  incomingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-background rounded-xl border border-foreground/15 p-3 flex items-center gap-3"
                    >
                      <div className="w-9 h-9 rounded-full bg-foreground/10 flex items-center justify-center text-xs font-bold shrink-0">
                        {(req.from?.firstName?.[0] ?? "") +
                          (req.from?.lastName?.[0] ?? "")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {req.from?.firstName} {req.from?.lastName}
                        </p>
                      </div>
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          className="h-8 rounded-lg bg-foreground text-background hover:bg-primary text-xs px-3"
                          disabled={busyConnectionId === req.id}
                          onClick={() =>
                            void respondToRequest(req.id, "accept")
                          }
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-lg text-xs px-3"
                          disabled={busyConnectionId === req.id}
                          onClick={() =>
                            void respondToRequest(req.id, "reject")
                          }
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                {role === "STUDENT" &&
                  availableAdvisors.slice(0, 5).map((adv) => (
                    <div
                      key={adv.id}
                      className="bg-background rounded-xl border border-foreground/15 p-3 flex items-center gap-3"
                    >
                      <div className="w-9 h-9 rounded-full bg-foreground/10 flex items-center justify-center text-xs font-bold shrink-0">
                        {(adv.firstName[0] ?? "") + (adv.lastName[0] ?? "")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {adv.firstName} {adv.lastName}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className="h-8 rounded-lg bg-foreground text-background hover:bg-primary text-xs px-3 shrink-0"
                        disabled={busyConnectionId === adv.id}
                        onClick={() => void requestConnection(adv.id)}
                      >
                        Connect
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          )}
      </section>

      {/* ════════════════════════════════════════════════════════
          MOBILE FULL-SCREEN CHAT OVERLAY  (WhatsApp style)
          Fixed over everything including header & bottom nav
      ════════════════════════════════════════════════════════ */}
      {mobileView === "chat" && (
        <div
          className="lg:hidden fixed inset-0 z-120 flex flex-col bg-background"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          {/* ── WhatsApp-style header ── */}
          <div className="shrink-0 flex items-center gap-2.5 bg-primary text-primary-foreground px-2 py-2.5">
            <button
              type="button"
              onClick={() => setMobileView("contacts")}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary-foreground/20 active:bg-primary-foreground/30 transition-colors shrink-0"
              aria-label="Back to contacts"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="w-10 h-10 rounded-full bg-primary-foreground/25 flex items-center justify-center text-sm font-bold shrink-0">
              {getInitials(selectedContact)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight truncate">
                {selectedContact
                  ? `${selectedContact.firstName} ${selectedContact.lastName}`
                  : "Chat"}
              </p>
              <p className="text-[11px] opacity-80 truncate">
                {selectedContact?.email}
              </p>
            </div>
          </div>

          {/* ── Chat wallpaper / messages ── */}
          <div
            className="flex-1 overflow-y-auto overscroll-contain scrollbar-none p-3 space-y-2 flex flex-col"
            style={{ background: "var(--background)" }}
          >
            {renderMessages()}
          </div>

          {/* ── Input bar with safe area ── */}
          <div
            className="shrink-0 border-t border-foreground/10 bg-background/95 backdrop-blur-sm px-3 pt-2.5"
            style={{
              paddingBottom: "max(env(safe-area-inset-bottom), 12px)",
            }}
          >
            {renderInput(true)}
          </div>
        </div>
      )}
    </>
  );
}
