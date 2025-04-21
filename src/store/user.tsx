import { createContext, useContext, useState, ReactNode } from "react";
import { UserAuthDto } from "../types/api-types";

interface UserContextType {
  user: UserAuthDto | null;
  setUser: (user: UserAuthDto | null) => void;
  clearUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserAuthDto | null>(null);

  const updateUser = (user: UserAuthDto | null) => setUser(user);
  const clearUser = () => updateUser(null);

  return (
    <UserContext.Provider value={{ user, setUser: updateUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
