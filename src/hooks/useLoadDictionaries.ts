import { useEffect } from "react";
import { dictionaryService } from "../services/dictionaryService";

export const useLoadDictionaries = (userId?: number, disciplineId?: number) => {
  useEffect(() => {
    if (typeof userId !== "number") return;
    void dictionaryService.loadAll(userId, disciplineId).catch(error => {
      console.warn("Не удалось загрузить справочники:", error instanceof Error ? error.message : "Ошибка запроса");
    });
  }, [userId, disciplineId]);
};
