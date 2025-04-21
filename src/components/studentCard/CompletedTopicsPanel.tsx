import { useEffect, useState } from "react";
import { useDictionaryStore } from "../../store/dictionaryStore";
import { api } from "../../lib/api";

interface Props {
  studentId: number;
  initialCompletedTopicIds: number[];
  onUpdate?: (updatedIds: number[]) => void;
}

const CompletedTopicsPanel: React.FC<Props> = ({
  studentId,
  initialCompletedTopicIds,
  onUpdate,
}) => {
  const { topics, loadedTopics } = useDictionaryStore();
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    setSelected(initialCompletedTopicIds);
  }, [initialCompletedTopicIds]);

  const handleToggle = (id: number) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((t) => t !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleSave = async () => {
    try {
      await api.updateStudentCompletedTopics(studentId, selected);
      onUpdate?.(selected);
      alert("Темы обновлены!");
    } catch (e) {
      console.error("Ошибка при обновлении тем:", e);
      alert("Ошибка сохранения тем.");
    }
  };

  if (!loadedTopics) {
    return <p className="text-sm text-gray-500">Загрузка тем...</p>;
  }

  return (
    <div className="p-4 border rounded bg-white shadow-md">
      <h2 className="text-xl font-semibold mb-4">Пройденные темы</h2>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {topics.map((topic) => (
          <label key={topic.topicId} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selected.includes(topic.topicId)}
              onChange={() => handleToggle(topic.topicId)}
            />
            <span>{topic.topic}</span>
          </label>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="mt-4 px-4 py-2 bg-primary text-text_light rounded hover:opacity-90"
      >
        💾 Сохранить изменения
      </button>
    </div>
  );
};

export default CompletedTopicsPanel;
