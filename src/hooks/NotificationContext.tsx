import { createContext, useContext, useState } from "react";

interface NotificationContextType {
  unread: number;
  setUnread: React.Dispatch<React.SetStateAction<number>>;
}

const NotificationContext =
  createContext<NotificationContextType | null>(null);

export const NotificationProvider = ({ children }: any) => {
  const [unread, setUnread] = useState(0);

  return (
    <NotificationContext.Provider
      value={{ unread, setUnread }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (!context)
    throw new Error(
      "useNotification must be used inside NotificationProvider"
    );

  return context;
};