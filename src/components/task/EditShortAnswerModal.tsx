import React, { useState, useEffect, useRef } from "react";
import { api } from "../../lib/api";

interface EditShortAnswerModalProps {
  taskId: number;
  initialValue: number | null;
  onClose: () => void;
  onSave?: (newValue: number) => void;
}

const EditShortAnswerModal: React.FC<EditShortAnswerModalProps> = ({
  taskId,
  initialValue,
  onClose,
  onSave,
}) => {
  const [value, setValue] = useState<string>(initialValue?.toString() || "");
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Закрытие по esc и клику вне
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleSubmit = async () => {
    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
      alert("Введите корректное число");
      return;
    }

    setLoading(true);
    try {
      await api.updateShortAnswer({ taskId, shortAnswer: parsed });
      onSave?.(parsed);
      onClose();
    } catch (err) {
      console.error("Ошибка обновления краткого ответа:", err);
      alert("Не удалось обновить ответ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 p-6 rounded shadow-md w-[90%] max-w-md"
      >
        <h2 className="text-lg font-semibold mb-4">Изменить краткий ответ</h2>

        <input
          type="number"
          step="any"
          className="w-full p-2 border rounded mb-4 text-black dark:text-white"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400"
            disabled={loading}
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditShortAnswerModal;
