import { create } from "zustand";
import { useDictionaryStore } from "./dictionaryStore";


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
  
      useDictionaryStore.getState().resetDisciplineDependentData();
    },
  
    clearDiscipline: () => {
      localStorage.removeItem("selectedDisciplineId");
      set({ disciplineId: null });
    },
    }));
