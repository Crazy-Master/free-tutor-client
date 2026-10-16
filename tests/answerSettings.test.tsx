import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import AnswerSettingsEditor from "../src/components/task/AnswerSettingsEditor";
import { api } from "../src/lib/api";
import { mapTaskDtoToCardTask } from "../src/lib/mapTaskDtoToCardTask";

vi.mock("../src/lib/api", () => ({ api: { getAnswerSettings: vi.fn(), updateAnswerSettings: vi.fn() } }));
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(api.getAnswerSettings).mockResolvedValue({mode:0,referenceAnswer:null,revision:0,legacyShortAnswer:"42"});
  vi.mocked(api.updateAnswerSettings).mockResolvedValue({mode:2,referenceAnswer:"00120",revision:1});
});
afterEach(cleanup);
function show(){const onSaved=vi.fn();const onClose=vi.fn();render(<AnswerSettingsEditor taskId={825} onSaved={onSaved} onClose={onClose}/>);return{onSaved,onClose};}
it("saves leading zeros as a string and preserves the server revision", async () => {
  const {onSaved}=show();
  fireEvent.change(await screen.findByLabelText("Режим проверки"),{target:{value:"2"}});
  fireEvent.change(screen.getByLabelText("Эталонный ответ"),{target:{value:"00120"}});
  fireEvent.click(screen.getByText("Сохранить настройки"));
  await waitFor(()=>expect(onSaved).toHaveBeenCalled());
  expect(api.updateAnswerSettings).toHaveBeenCalledWith(825,{mode:2,referenceAnswer:"00120",revision:0});
});
it("does not silently import legacy values or guess a mode", async () => {
  show();await screen.findByLabelText("Режим проверки");
  expect((screen.getByLabelText("Режим проверки") as HTMLSelectElement).value).toBe("0");
  fireEvent.change(screen.getByLabelText("Режим проверки"),{target:{value:"1"}});
  expect((screen.getByLabelText("Эталонный ответ") as HTMLInputElement).value).toBe("");
  fireEvent.click(screen.getByText(/Взять прежний ответ/));
  expect((screen.getByLabelText("Эталонный ответ") as HTMLInputElement).value).toBe("42");
});
it("clears the reference explicitly when switching to manual", async () => {
  vi.mocked(api.getAnswerSettings).mockResolvedValue({mode:2,referenceAnswer:"00120",revision:7});
  show();fireEvent.change(await screen.findByLabelText("Режим проверки"),{target:{value:"3"}});
  fireEvent.click(screen.getByText("Сохранить настройки"));
  await waitFor(()=>expect(api.updateAnswerSettings).toHaveBeenCalledWith(825,{mode:3,referenceAnswer:null,revision:7}));
});
it("keeps the draft on a revision conflict and reloads only on explicit request", async () => {
  vi.mocked(api.updateAnswerSettings).mockRejectedValue(new Error("Настройки уже изменены"));
  const {onClose}=show();
  fireEvent.change(await screen.findByLabelText("Режим проверки"),{target:{value:"2"}});
  fireEvent.change(screen.getByLabelText("Эталонный ответ"),{target:{value:"00120"}});
  fireEvent.click(screen.getByText("Сохранить настройки"));
  await screen.findByText("Настройки уже изменены");
  expect(onClose).not.toHaveBeenCalled();
  expect((screen.getByLabelText("Эталонный ответ") as HTMLInputElement).value).toBe("00120");
  vi.mocked(api.getAnswerSettings).mockResolvedValue({mode:1,referenceAnswer:"43",revision:8});
  fireEvent.click(screen.getByText("Загрузить актуальные настройки"));
  await waitFor(()=>expect((screen.getByLabelText("Эталонный ответ") as HTMLInputElement).value).toBe("43"));
});
it("shows load failure and does not offer saving unknown settings",async()=>{
  vi.mocked(api.getAnswerSettings).mockRejectedValue(new Error("Нет сети"));show();
  await screen.findByText("Нет сети");expect(screen.queryByText("Сохранить настройки")).toBeNull();
});
it("never takes a reference from the unreliable source answer",()=>{
  const task=mapTaskDtoToCardTask({taskId:825,taskIdExternal:"x",groupNumber:1,disciplineId:5,answerTask:"999",checkingMode:2,referenceAnswer:"00120",problemSolving:{shortAnswer:42}});
  expect(task.shortAnswer).toBe(42);expect(task.referenceAnswer).toBe("00120");
});
