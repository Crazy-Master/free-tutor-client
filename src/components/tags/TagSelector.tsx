import React, { useState, useRef, useEffect } from "react";
import { useDictionaryStore } from "../../store/dictionaryStore";
import { api } from "../../lib/api";
import CreateTagModal from "./CreateTagModal";
import EditTagModal from "./EditTagModal";

interface Tag {
  tagId: number;
  name: string;
  color: string;
}

interface TagSelectorProps {
  taskId: number;
  selectedTags: Tag[];
  onTagUpdate?: (tags: Tag[]) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  taskId,
  selectedTags,
  onTagUpdate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tagToEdit, setTagToEdit] = useState<Tag | null>(null);

  const { taskTags, loadTaskTags } = useDictionaryStore();
  const ref = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleOutsideClick = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setIsOpen(false);
      setEditMode(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const isSelected = (tagId: number) =>
    selectedTags.some((t) => t.tagId === tagId);

  const handleToggleTag = async (tag: Tag) => {
    if (editMode) return;

    try {
      if (isSelected(tag.tagId)) {
        await api.removeTagFromTask(taskId, tag.tagId);
        onTagUpdate?.(selectedTags.filter((t) => t.tagId !== tag.tagId));
      } else {
        await api.addTagToTask(taskId, tag.tagId);
        onTagUpdate?.([...selectedTags, tag]);
      }
    } catch (err) {
      console.error("Ошибка при обновлении тега:", err);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <div
        className="overflow-x-auto flex gap-2 max-w-[320px] whitespace-nowrap px-2 py-1 rounded bg-secondary text-sm cursor-pointer"
        onClick={toggleDropdown}
      >
        {selectedTags.length > 0 ? (
          selectedTags.map((tag) => (
            <span
              key={tag.tagId}
              className="px-2 py-0.5 rounded"
              style={{ backgroundColor: tag.color, color: "#fff" }}
            >
              {tag.name}
            </span>
          ))
        ) : (
          <span className="text-gray-500 italic">добавить тег</span>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-40 mt-1 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 border rounded shadow p-3 w-80 text-md space-y-2">
          {taskTags.map((tag) => {
            const isTagSelected = isSelected(tag.tagId);

            return (
              <div
                key={tag.tagId}
                className="flex items-center gap-2 cursor-pointer"
                onClick={() =>
                  editMode ? setTagToEdit(tag) : handleToggleTag(tag)
                }
              >
                {!editMode ? (
                  <input
                    type="checkbox"
                    checked={isTagSelected}
                    readOnly
                    className="cursor-pointer"
                  />
                ) : (
                  <span className="text-xs text-gray-500 ml-1">⚙️</span>
                )}
                <span
                  className="px-2 py-0.5  rounded truncate max-w-full overflow-hidden whitespace-nowrap"
                  style={{ backgroundColor: tag.color, color: "#fff" }}
                >
                  {tag.name}
                </span>
              </div>
            );
          })}

          <div className="flex justify-between pt-2 border-t mt-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-2 py-1 bg-primary text-text_light rounded hover:opacity-90"
            >
              ➕ Создать тег
            </button>
            <button
              onClick={() => setEditMode((prev) => !prev)}
              className="px-2 py-1 bg-primary text-text_light rounded hover:opacity-90"
            >
              🛠 Редактировать
            </button>
          </div>
        </div>
      )}

      {showCreateModal && (
        <CreateTagModal
          onClose={() => setShowCreateModal(false)}
          onCreateSuccess={() => loadTaskTags()}
        />
      )}

      {tagToEdit && (
        <EditTagModal
          tagId={tagToEdit.tagId}
          name={tagToEdit.name}
          color={tagToEdit.color}
          onClose={() => setTagToEdit(null)}
          onSave={() => {
            loadTaskTags();
            const updated = taskTags.find((t) => t.tagId === tagToEdit.tagId);
            if (updated && isSelected(updated.tagId)) {
              const newList = selectedTags.map((tag) =>
                tag.tagId === updated.tagId ? updated : tag
              );
              onTagUpdate?.(newList);
            }
            setTagToEdit(null);
          }}
          onDelete={() => {
            loadTaskTags();
            onTagUpdate?.(
              selectedTags.filter((t) => t.tagId !== tagToEdit.tagId)
            );
            setTagToEdit(null);
          }}
        />
      )}
    </div>
  );
};

export default TagSelector;
