import { createContext, useContext, useEffect, useState } from "react";

interface AssignLoadContextType {
  selectedDate: string;
  setSelectedDate: React.Dispatch<React.SetStateAction<string>>;
}

const AssignLoadContext = createContext<AssignLoadContextType | null>(null);

export const AssignLoadProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const today = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(
    () => sessionStorage.getItem("assignLoadsDate") || today,
  );

  useEffect(() => {
    sessionStorage.setItem("assignLoadsDate", selectedDate);
  }, [selectedDate]);

  return (
    <AssignLoadContext.Provider value={{ selectedDate, setSelectedDate }}>
      {children}
    </AssignLoadContext.Provider>
  );
};

export const useAssignLoad = () => {
  const context = useContext(AssignLoadContext);

  if (!context) {
    throw new Error("useAssignLoad must be used inside AssignLoadProvider");
  }

  return context;
};