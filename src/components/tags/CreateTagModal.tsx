import React, { useState, useEffect } from "react";
import { api } from "../../lib/api";

interface CreateTagModalProps {
  onClose: () => void;
  onCreateSuccess: () => void;
}

const CreateTagModal: React.FC<CreateTagModalProps> = ({
  onClose,
  onCreateSuccess,
}) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#2c7be5");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !color) return;

    try {
      await api.createTag({ name, color });
      onCreateSuccess();
      onClose();
    } catch (err) {
      console.error("Ошибка создания тега:", err);
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
    >
      <div
        className="bg-white dark:bg-gray-800 p-6 rounded shadow-md w-full max-w-md space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold">Создать тег</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-md">Название</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded text-black"
              required
            />
          </div>
          <div>
            <label className="block text-md">Цвет</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-10 cursor-pointer"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-secondary_other text-text_dark rounded hover:opacity-90"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-text_light rounded hover:opacity-90"
              disabled={!name || !color}
            >
              Создать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTagModal;
