import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";

interface EditTagModalProps {
  tagId: number;
  name: string;
  color: string;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
}

const EditTagModal: React.FC<EditTagModalProps> = ({
  tagId,
  name: initialName,
  color: initialColor,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !color) return;
    try {
      await api.updateTag({ tagId, name, color });
      onSave();
      onClose();
    } catch (err) {
      console.error("Ошибка обновления тега:", err);
    }
  };

  const handleDelete = async () => {
    if (confirm("Удалить тег навсегда?")) {
      try {
        await api.deleteTag(tagId);
        onDelete();
        onClose();
      } catch (err) {
        console.error("Ошибка удаления тега:", err);
      }
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
    >
      <div
        className="bg-white dark:bg-gray-800 p-6 rounded shadow-md w-full max-w-md space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold">Редактировать тег</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm">Название</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded text-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm">Цвет</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-10 cursor-pointer"
              required
            />
          </div>
          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-text_light rounded hover:bg-red-700"
            >
              Удалить
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-text_light rounded hover:bg-blue-700"
                disabled={!name || !color}
              >
                Сохранить
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTagModal;
