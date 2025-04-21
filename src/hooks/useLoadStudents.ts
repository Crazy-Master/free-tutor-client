import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useStudentStore } from "../store/studentStore";
import { useDisciplineStore } from "../store/disciplineStore";

export const useLoadStudents = () => {
  const { disciplineId } = useDisciplineStore();
  const { setStudents } = useStudentStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!disciplineId) return;

    const fetch = async () => {
      try {
        setLoading(true);
        const data = await api.getStudents(disciplineId);
        setStudents(data);
        setError(null);
      } catch (e) {
        if (e instanceof Error) {
          console.error("Ошибка API:", e.message);
          setError("Ошибка загрузки учеников.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [disciplineId, setStudents]);

  return { loading, error };
};
