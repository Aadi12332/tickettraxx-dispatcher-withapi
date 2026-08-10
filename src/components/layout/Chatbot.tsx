import { useEffect, useRef, useState } from "react";
import { X, Send } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import {
  BASE_URL,
  DRIVER_ENDPOINTS,
  STORAGE_KEYS,
} from "../../constants/api.constants";
import {
  getConversationsFromFirestore,
  getMessages,
  sendMessage as fbSendMessage,
  subscribeToMessages,
  // syncDriversToFirestore,
} from "../firebase/chatService";

type ApiErrorResponse = {
  error?: {
    message?: unknown;
  };
};

const hasInvalidOrExpiredTokenError = async (response: Response) => {
  if (response.ok) return false;

  const payload = (await response
    .clone()
    .json()
    .catch(() => null)) as ApiErrorResponse | null;

  return payload?.error?.message === "Invalid or expired token";
};

interface ChatbotProps {
  open: boolean;
  onClose: () => void;
}

type ChatMessage = {
  id: string;
  text: string;
  sender: "me" | "them";
  time: string;
};

type Conversation = {
  id: string;
  name: string;
  lastMessage: string;
  unread: number;
  avatar?: string;
};

type Driver = {
  _id?: string;
  id?: string;
  name?: string;
  driverCode?: string;
  contractorId?: { contractorCode?: string };
  avatar?: string;
  profileImage?: string;
};

type DriverListResponse = {
  data?: Driver[];
};

const getDrivers = (payload: unknown): Driver[] => {
  if (!payload || typeof payload !== "object" || !("data" in payload)) {
    return [];
  }

  const { data } = payload as DriverListResponse;
  return Array.isArray(data) ? data : [];
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

// Profile photo ho to wahi dikhao, warna naam ke initials wala fallback circle
const Avatar = ({
  name,
  src,
  size = "w-9 h-9",
}: {
  name: string;
  src?: string;
  size?: string;
}) =>
  src ? (
    <img
      src={src}
      alt={name}
      className={`${size} rounded-full object-cover shrink-0 border border-gray-200`}
    />
  ) : (
    <div
      className={`${size} rounded-full bg-gray-300 flex items-center justify-center text-black text-xs font-semibold shrink-0 border border-gray-200`}
    >
      {getInitials(name)}
    </div>
  );

export default function Chatbot({ open, onClose }: ChatbotProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, ChatMessage[]>>({});
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { user, logout } = useAuth();
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const userId = user?._id;
  const userName = user?.name;
  // const [syncing, setSyncing] = useState(false);
  // const [syncResult, setSyncResult] = useState<string | null>(null);

  const selectedConversation = conversations.find((c) => c.id === selectedId);
  const messages = messagesByConversation[selectedId] ?? [];

  const filteredConversations = conversations.filter((conv) => {
    const query = search.toLowerCase().trim();

    return (
      conv.name.toLowerCase().includes(query) ||
      conv.lastMessage.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    if (!open) return;
    setTimeout(
      () => scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" }),
      50,
    );
  }, [open, selectedId, messages.length]);

  // Fetch conversation list (drivers/contractors) from existing API when chat opens
  useEffect(() => {
    if (!open) return;
    let mounted = true;

    (async () => {
      try {
        let convs: Conversation[] = [];

        if (token) {
          try {
            const res = await fetch(`${BASE_URL}${DRIVER_ENDPOINTS.DRIVERS}`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (await hasInvalidOrExpiredTokenError(res)) {
              logout();
            } else {
              const payload = (await res.json().catch(() => null)) as unknown;
              const list = getDrivers(payload);
              convs = list.map((d) => ({
                id: d._id ?? String(d.id ?? Math.random()),
                name: d.name ?? d.driverCode ?? d.contractorId?.contractorCode ?? "Unknown",
                lastMessage: "",
                unread: 0,
                avatar: d.avatar ?? d.profileImage,
              }));
            }
          } catch (err) {
            console.warn("Backend drivers fetch failed, falling back to Firestore", err);
          }
        }

        // If we couldn't get conversations from backend, try Firestore
        if (convs.length === 0) {
          try {
            const items = await getConversationsFromFirestore();
            convs = items.map((item) => ({
              id: item.id,
              name: item.name,
              lastMessage: "",
              unread: 0,
              avatar: item.avatar,
            }));
          } catch (err) {
            console.error("Failed to load conversations from Firestore", err);
          }
        }

        if (!mounted) return;
        setConversations(convs);
        if (convs.length > 0) setSelectedId((current) => current || convs[0].id);
      } catch (err) {
        console.error("Failed to load conversations", err);
      }
    })();

    return () => { mounted = false; };
  }, [open, token, logout]);

  // Subscribe to Firestore messages for selected conversation when opened
  useEffect(() => {
    if (!open || !selectedId) return;

    let mounted = true;
    // load existing messages once
    (async () => {
      try {
        const docs = await getMessages(selectedId, 200);
        if (!mounted) return;
        // map firestore messages to ChatMessage shape used by UI
        const mapped = docs.map((d) => {
          const sender = (d.senderId === userId ? "me" : "them") as "me" | "them";
          const time = d.createdAt && d.createdAt.toDate ? d.createdAt.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          return { id: d.id ?? `${Date.now()}-${Math.random()}`, text: d.text, sender, time };
        }) as ChatMessage[];

        setMessagesByConversation((prev) => ({ ...prev, [selectedId]: mapped }));
      } catch {
        // ignore
      }
    })();

    // subscribe to live updates
    const unsub = subscribeToMessages(selectedId, (docs) => {
      if (!mounted) return;
      const mapped = docs.map((d) => {
        const sender = (d.senderId === userId ? "me" : "them") as "me" | "them";
        const time = d.createdAt && d.createdAt.toDate ? d.createdAt.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        return { id: d.id ?? `${Date.now()}-${Math.random()}`, text: d.text, sender, time };
      }) as ChatMessage[];
      setMessagesByConversation((prev) => ({ ...prev, [selectedId]: mapped }));
    });

    return () => {
      mounted = false;
      unsub();
    };
  }, [open, selectedId, userId]);

  const handleSend = async () => {
    if (!input.trim() || !selectedId) return;

    const text = input.trim();

    const optimistic: ChatMessage = {
      id: `local-${Date.now()}`,
      text,
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // optimistic UI
    setMessagesByConversation((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] ?? []), optimistic],
    }));

    setInput("");

    try {
      const messagePayload = {
        text,
        senderId: userId ?? "anonymous",
        senderName: userName ?? null,
      };

      // Prefer backend API if token available
      if (token) {
        const res = await fetch(`${BASE_URL}${DRIVER_ENDPOINTS.DRIVER_BY_ID(encodeURIComponent(selectedId))}/message`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: text }),
        });

        if (await hasInvalidOrExpiredTokenError(res)) {
          logout();
          throw new Error("Invalid token");
        }

        if (!res.ok) {
          // fallback to Firestore if backend fails
          await fbSendMessage(selectedId, messagePayload);
        } else {
          // Persist to Firestore as well so the chat loads on refresh
          try {
            await fbSendMessage(selectedId, messagePayload);
          } catch (firestoreErr) {
            console.warn("Backend succeeded but Firestore save failed", firestoreErr);
          }
        }
      } else {
        // No token -> send directly to Firestore
        await fbSendMessage(selectedId, messagePayload);
      }
    } catch (err) {
      // revert optimistic message on error
      setMessagesByConversation((prev) => ({
        ...prev,
        [selectedId]: (prev[selectedId] ?? []).filter((m) => m.id !== optimistic.id),
      }));
      console.error("Failed to send message", err);
    }
  };

  // const handleSyncDrivers = async () => {
  //   if (syncing) return;
  //   setSyncing(true);
  //   try {
  //     if (!token) {
  //       setSyncResult("Sign in to sync drivers.");
  //       return;
  //     }

  //     const res = await fetch(`${BASE_URL}${DRIVER_ENDPOINTS.DRIVERS}`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });

  //     if (await hasInvalidOrExpiredTokenError(res)) {
  //       logout();
  //       return;
  //     }

  //     const payload = (await res.json().catch(() => null)) as unknown;
  //     const list = getDrivers(payload);
  //     if (list.length > 0) {
  //       try {
  //         const result = await syncDriversToFirestore(list);
  //         const msg = `Synced ${result?.synced ?? 0}/${list.length}`;
  //         console.log(msg, result);
  //         setSyncResult(result?.errors?.length ? `${msg} — ${result.errors.length} errors` : msg);

  //         // refresh conversations from Firestore after sync
  //         try {
  //           const items = await getConversationsFromFirestore();
  //           const convs = items.map((item) => ({
  //             id: item.id,
  //             name: item.name,
  //             lastMessage: "",
  //             unread: 0,
  //             avatar: item.avatar,
  //           }));
  //           setConversations(convs);
  //           if (convs.length > 0) setSelectedId((current) => current || convs[0].id);
  //         } catch (err) {
  //           console.warn("Failed to refresh conversations after sync", err);
  //         }
  //       } catch (err) {
  //         console.error('syncDriversToFirestore failed', err);
  //         setSyncResult('Sync failed — check console');
  //       }
  //     } else {
  //       setSyncResult('No drivers returned from API');
  //     }
  //   } catch (err) {
  //     console.error("Failed to sync drivers to Firestore", err);
  //   } finally {
  //     setSyncing(false);
  //   }
  // };

  const handleClose = () => {
    setInput("");
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-50 text-black"
        onClick={handleClose}
        aria-hidden
      />

      <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999] pointer-events-none text-black">
        <div className="w-full max-w-[850px] h-[600px] bg-white rounded-[8px] shadow-sm overflow-hidden flex flex-col pointer-events-auto">
          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between border-b border-[#E5E7EB]">
            <h2 className="text-lg font-semibold text-black">Messages</h2>
            <div className="flex items-center gap-2">
              {/* <button
                onClick={handleSyncDrivers}
                disabled={syncing}
                className="px-3 py-1 rounded text-sm bg-blue-600 text-white hover:opacity-90 disabled:opacity-60"
              >
                {syncing ? "Syncing..." : "Sync"}
              </button> */}
              {/* {syncResult && (
                <div className="text-xs text-gray-600 mr-2">{syncResult}</div>
              )} */}
              <button onClick={handleClose} className="cursor-pointer">
                <X className="size-5 text-black" />
              </button>
            </div>
          </div>

          {/* Body: list + chat */}
          <div className="flex flex-1 min-h-0">
            <div className="w-[280px] shrink-0 border-r border-[#E5E7EB] overflow-y-auto scroll-hide">
              <div className="p-2 sticky top-0 bg-white z-10 border-b border-[#E5E7EB]">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full p-2 border rounded-lg outline-none text-sm border-[#E5E7EB]"
                />
              </div>
              {filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-400">
                  No conversations found.
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isActive = conv.id === selectedId;

                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedId(conv.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer border-b border-[#F3F4F6] transition-colors ${
                        isActive ? "bg-[#F5F8FF]" : "hover:bg-[#FAFAFA]"
                      }`}
                    >
                      <Avatar name={conv.name} src={conv.avatar} />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-black truncate">
                            {conv.name}
                          </span>

                          {conv.unread > 0 && (
                            <span className="shrink-0 w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center">
                              {conv.unread}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[#6B7280] truncate">
                          {conv.lastMessage}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Right: chat pane */}
            <div className="flex-1 flex flex-col min-h-0">
              {selectedConversation ? (
                <>
                  {/* Chat header */}
                  <div className="px-4 py-[11px] border-b border-[#E5E7EB] flex items-center gap-3">
                    <Avatar
                      name={selectedConversation.name}
                      src={selectedConversation.avatar}
                      size="w-8 h-8"
                    />
                    <span className="text-sm font-semibold text-black">
                      {selectedConversation.name}
                    </span>
                  </div>

                  {/* Messages */}
                  <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto px-4 py-3"
                  >
                    {messages.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-sm text-gray-400">
                        No messages yet. Send the first message.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {messages.map((m) => (
                          <div
                            key={m.id}
                            className={`p-2.5 rounded-lg max-w-[75%] ${
                              m.sender === "me"
                                ? "bg-[#F3F4F6] text-black self-end text-right"
                                : "bg-[#F3F4F6] text-black self-start text-left"
                            }`}
                          >
                            <div className="text-sm">{m.text}</div>
                            <div
                              className={`text-[10px] mt-1 ${
                                m.sender === "me"
                                  ? "text-gray-400"
                                  : "text-gray-400"
                              }`}
                            >
                              {m.time}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="px-4 py-3 border-t border-[#E5E7EB]">
                    <div className="flex items-center gap-2">
                      <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSend();
                        }}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none text-sm text-black"
                      />
                      <button
                        onClick={handleSend}
                        className="p-2.5 rounded-lg bg-gray-300 text-black hover:opacity-90 cursor-pointer transition-opacity"
                        aria-label="Send message"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
                  Select a conversation to start chatting
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
