import { useEffect } from "react";
import { useAuth } from "../store/auth";
import { useUser } from "../store/user";
import { useDisciplineStore } from "../store/disciplineStore";
import { dictionaryService } from "../services/dictionaryService";

export const useAutoLogin = () => {
  const { token, login } = useAuth();
  const { setUser } = useUser();
  const { setDisciplineId } = useDisciplineStore();

  useEffect(() => {
    const refresh = async () => {
      try {
        const res = await fetch("https://api-tutor-master.ru/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (!res.ok) return;
        const data = await res.json();

        login(data.tokenString);
        setUser(data.userAuthDto);

        const lastId = data.userAuthDto.information?.lastDisciplineId;
        if (lastId) {
          setDisciplineId(lastId);
          dictionaryService.reset();
        }
      } catch (err) {
        console.warn("Автологин не удался:", err);
      }
    };

    if (!token) {
      refresh();
    }
  }, [token, login, setUser, setDisciplineId]);
};
