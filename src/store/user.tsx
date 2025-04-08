import { createContext, useContext, useState, useEffect } from "react";

export interface UserInfoDto {
  lastDisciplineId: number;
  studentIds: number[];
  notes: Record<number, string>;
}

export interface UserAuthDto {
  email: string;
  lastActiveAt: string | null;
  information: UserInfoDto;
}

interface UserContextType {
  user: UserAuthDto | null;
  setUser: (user: UserAuthDto | null) => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserAuthDto | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const updateUser = (user: UserAuthDto | null) => {
    setUser(user);
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser: updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
