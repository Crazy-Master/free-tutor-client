import { authClient } from "./http";
import { tokenIdentity } from "./authClient";
import { useStudentStore } from "../store/studentStore";
import { useDictionaryStore } from "../store/dictionaryStore";
import { useDisciplineStore } from "../store/disciplineStore";
import { dictionaryService } from "../services/dictionaryService";

let previousIdentity = "";
const unsubscribe = authClient.subscribe(() => {
  const session = authClient.getSnapshot();
  const user = tokenIdentity(session.token);
  const identity = `${session.boundary}:${user?.userId ?? ""}:${user?.role ?? ""}`;
  if (previousIdentity === identity) return;
  previousIdentity = identity;
  dictionaryService.clear();
  useStudentStore.getState().setStudents([]);
  useDictionaryStore.getState().clear();
  useDisciplineStore.getState().clearDiscipline();
  const discipline = session.user?.information.lastDisciplineId;
  if (discipline && discipline > 0) useDisciplineStore.getState().setDisciplineId(discipline);
});
if (import.meta.hot) import.meta.hot.dispose(unsubscribe);
