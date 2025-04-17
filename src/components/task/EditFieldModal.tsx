import React, { useEffect, useRef, useState } from "react";

interface EditFieldModalProps {
  title: string;
  label: string;
  initialValue: string | number;
  inputType?: "text" | "number";
  onClose: () => void;
  onSubmit: (newValue: string) => Promise<void>;
}

const EditFieldModal: React.FC<EditFieldModalProps> = ({
  title,
  label,
  initialValue,
  inputType = "text",
  onClose,
  onSubmit,
}) => {
  const [value, setValue] = useState<string>(initialValue.toString());
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Закрытие по esc и клику вне
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target as Node)
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
    if (!value.trim()) {
      alert("Поле не должно быть пустым");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(value);
      onClose();
    } catch (err) {
      console.error("Ошибка при обновлении:", err);
      alert("Не удалось сохранить изменения");
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
        <h2 className="text-lg font-semibold mb-4">{title}</h2>

        <label className="block font-medium mb-1">{label}</label>
        <input
          type={inputType}
          className="w-full p-2 border rounded mb-4 text-black dark:text-text_light"
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
            className="px-4 py-1 bg-primary text-text_light rounded hover:bg-blue-700"
            disabled={loading}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditFieldModal;
