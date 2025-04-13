import { create } from "zustand";
import { useDictionaryStore } from "./dictionaryStore";
import { dictionaryService } from "../services/dictionaryService";


interface DisciplineStore {
   disciplineId: number | null;
   setDisciplineId: (id: number) => void;
   clearDiscipline: () => void;
  }
  
  export const useDisciplineStore = create<DisciplineStore>((set) => ({
    disciplineId: parseInt(localStorage.getItem("selectedDisciplineId") ?? "0"),
  
    setDisciplineId: (id: number) => {
      localStorage.setItem("selectedDisciplineId", id.toString());
      set({ disciplineId: id });
  
      dictionaryService.reset();
      useDictionaryStore.getState().resetDisciplineDependentData();
    },
  
    clearDiscipline: () => {
      localStorage.removeItem("selectedDisciplineId");
      set({ disciplineId: null });
    },
    }));
