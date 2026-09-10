import { create } from "zustand";
import { useDictionaryStore } from "./dictionaryStore";
import { dictionaryService } from "../services/dictionaryService";


const readDiscipline = () => {
  try { const id = Number(localStorage.getItem("selectedDisciplineId")); return id > 0 ? id : null; }
  catch { return null; }
};

interface DisciplineStore {
   disciplineId: number | null;
   setDisciplineId: (id: number) => void;
   clearDiscipline: () => void;
  }
  
  export const useDisciplineStore = create<DisciplineStore>((set) => ({
    disciplineId: readDiscipline(),
  
    setDisciplineId: (id: number) => {
      try { localStorage.setItem("selectedDisciplineId", id.toString()); } catch { /* memory state still works */ }
      set({ disciplineId: id });
  
      dictionaryService.reset();
      useDictionaryStore.getState().resetDisciplineDependentData();
    },
  
    clearDiscipline: () => {
      try { localStorage.removeItem("selectedDisciplineId"); } catch { /* memory state still works */ }
      set({ disciplineId: null });
    },
    }));
