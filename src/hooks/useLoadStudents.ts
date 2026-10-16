import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useStudentStore } from "../store/studentStore";
import { useDisciplineStore } from "../store/disciplineStore";

export const useLoadStudents = () => {
  const { disciplineId } = useDisciplineStore();
  const { setStudents } = useStudentStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    setError(null);
    if (!disciplineId) { setLoading(false); setStudents([]); return; }

    let cancelled = false;
    setStudents([]);
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.getStudents(disciplineId);
        if (cancelled) return;
        setStudents(data);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        if (e instanceof Error) {
          setError(e.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => { cancelled = true; };
  }, [disciplineId, setStudents, retry]);

  return { loading, error, reload: () => setRetry(n => n + 1) };
};
