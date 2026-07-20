import { Trash2, X } from "lucide-react";
import NotiIcon from "../../assets/icons/noti-icon.svg";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  getNotificationsApi,
  getAlertsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
} from "../../services/auth.service";

import type { NotificationItem } from "../../types/auth.types";

type NotificationDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export default function NotificationDrawer({
  open,
  onClose,
}: NotificationDrawerProps) {
  const [tab, setTab] = useState<"notifications" | "alerts">(
    "notifications"
  );

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [alerts, setAlerts] = useState<NotificationItem[]>([]);

  const [selectedNotification, setSelectedNotification] =
    useState<NotificationItem | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!open) return;

    loadNotifications();
    loadAlerts();
  }, [open]);

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const res = await getNotificationsApi();

      setNotifications(res.data);
      setUnread(res.unread);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Unable to load notifications");
      } else {
        setError("Unable to load notifications");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAlerts = async () => {
    try {
      const res = await getAlertsApi();

      setAlerts(res.data);
    } catch {}
  };

  const markRead = async (id: string) => {
    try {
      await markNotificationReadApi(id);

      setNotifications((prev) =>
        prev.map((item) =>
          item._id === id
            ? {
                ...item,
                read: true,
              }
            : item
        )
      );

      setUnread((prev) => Math.max(prev - 1, 0));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await markAllNotificationsReadApi();

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          read: true,
        }))
      );

      setUnread(0);
    } catch {}
  };

  if (!open) return null;

  const currentItems =
    tab === "notifications" ? notifications : alerts;

      return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-[999]"
      />

      <div className="fixed top-0 right-0 h-screen w-full max-w-[500px] bg-white z-[1000] flex flex-col">

        <div className="flex items-center justify-between px-5 py-4 border-b border-[#315497]">

          <div>
            <h2 className="text-[20px] font-semibold">
              Notifications
            </h2>

            {tab === "notifications" && unread > 0 && (
              <p className="text-sm text-red-500 mt-1">
                {unread} unread
              </p>
            )}
          </div>

          <button className="cursor-pointer" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b">

          <button
            onClick={() => setTab("notifications")}
            className={`flex-1 py-3 font-medium cursor-pointer ${
              tab === "notifications"
                ? "border-b-2 border-[#315497] text-[#315497]"
                : "text-gray-500"
            }`}
          >
            Notifications
          </button>

          <button
            onClick={() => setTab("alerts")}
            className={`flex-1 py-3 font-medium cursor-pointer ${
              tab === "alerts"
                ? "border-b-2 border-[#315497] text-[#315497]"
                : "text-gray-500"
            }`}
          >
            Alerts
          </button>

        </div>

        {tab === "notifications" &&
          notifications.length > 0 && (
            <div className="p-3 border-b flex justify-end">

              <button
                onClick={markAllRead}
                className="text-sm text-[#315497] font-medium"
              >
                Mark All Read
              </button>

            </div>
          )}

        <div className="flex-1 overflow-y-auto p-5">

          {loading && (
            <div className="text-center py-10">
              Loading...
            </div>
          )}

          {!loading && error && (
            <div className="text-center text-red-500">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            currentItems.length > 0 && (

              <div className="space-y-4">

                {currentItems.map((item) => (

                  <div
                    key={item._id}
                    onClick={() => {

                      setSelectedNotification(item);

                      if (
                        tab === "notifications" &&
                        !item.read
                      ) {
                        markRead(item._id);
                      }
                    }}
                    className={`rounded-xl border p-4 cursor-pointer transition shadow-sm hover:shadow-md ${
                      !item.read && tab === "notifications"
                        ? "bg-blue-50 border-blue-300"
                        : "border-[#E5E5E5]"
                    }`}
                  >

                    <div className="flex justify-between gap-4">

                      <div className="flex-1">

                        <h3 className="font-semibold text-[16px]">

                          {item.title}

                        </h3>

                        <p className="text-sm text-[#8A8A8A] mt-1">

                          {item.message}

                        </p>

                        <p className="text-xs text-gray-400 mt-2">

                          {new Date(
                            item.createdAt
                          ).toLocaleString()}

                        </p>

                      </div>

                      {tab === "notifications" && (

                       <button
  onClick={(e) => {
    e.stopPropagation();

    // TODO: Call delete notification API once backend provides it.
  }}
  className="text-red-500 cursor-pointer"
>
  <Trash2 size={18} />
</button>

                      )}

                    </div>

                  </div>

                ))}

              </div>

            )}

          {!loading &&
            !error &&
            currentItems.length === 0 && (

              <div className="h-full flex flex-col justify-center items-center">

                <img
                  src={NotiIcon}
                  className="w-60"
                />

                <h3 className="text-xl mt-6">

                  No {tab}

                </h3>

                <p className="text-gray-500">

                  {tab === "notifications"
                    ? "Notification Inbox Empty"
                    : "No Alerts Found"}

                </p>

              </div>

            )}

        </div>


                {tab === "notifications" && notifications.length > 0 && (
          <div className="p-3 flex justify-center border-t">
           <button
  onClick={() => {
    // TODO: Call delete all notifications API once backend provides it.
  }}
  className="h-12 px-6 rounded-lg border border-[#FF5B73] text-[#FF5B73] text-sm font-medium"
>
  Delete All Notifications
</button>
          </div>
        )}
      </div>

      {selectedNotification && (
        <>
          <div
            onClick={() => setSelectedNotification(null)}
            className="fixed inset-0 bg-black/50 z-[1100]"
          />

          <div className="fixed inset-0 z-[1101] flex items-center justify-center px-5">

            <div className="w-full max-w-[700px] bg-white rounded-xl overflow-hidden shadow-xl">

              <div className="flex items-center justify-between px-5 py-4 border-b border-[#315497]">

                <div>

                  <h2 className="text-[20px] font-semibold">
                    {selectedNotification.title}
                  </h2>

                  <p className="text-sm text-gray-400 mt-1">
                    {new Date(
                      selectedNotification.createdAt
                    ).toLocaleString()}
                  </p>

                </div>

                <button className="cursor-pointer"
                  onClick={() => setSelectedNotification(null)}
                >
                  <X size={20} />
                </button>

              </div>

              <div className="px-5 py-5">

                <div className="mb-4">

                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      selectedNotification.severity === "error"
                        ? "bg-red-100 text-red-600"
                        : selectedNotification.severity === "warning"
                        ? "bg-yellow-100 text-yellow-700"
                        : selectedNotification.severity === "success"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {selectedNotification.severity}
                  </span>

                </div>

                <p className="text-[#6B7280] leading-7 whitespace-pre-wrap">
                  {selectedNotification.message}
                </p>

              </div>

            </div>

          </div>
        </>
      )}
    </>
  );
}