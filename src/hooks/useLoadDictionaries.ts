import { useEffect } from "react";
import { dictionaryService } from "../services/dictionaryService";

export const useLoadDictionaries = (userId?: number, disciplineId?: number) => {
  useEffect(() => {
    if (typeof userId !== "number") return;
    dictionaryService.loadAll(userId, disciplineId);
  }, [userId, disciplineId]);
};
