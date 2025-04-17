import React, { useRef, useState, useEffect } from "react";
import { FiChevronDown, FiCheck } from "react-icons/fi";

export interface Option {
  id: number;
  label: string;
  color?: string;
  disabled?: boolean;
}

interface Props {
  label: string;
  options: Option[];
  selected: number[];
  onChange: (selected: number[]) => void;
  placeholder?: string;
}

const MultiSelectDropdown: React.FC<Props> = ({
  label,
  options,
  selected,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSelection = (id: number) => {
    if (selected.includes(id)) {
      onChange(selected.filter((item) => item !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const isEmpty =
    options.length === 0 || (options.length === 1 && options[0].disabled);

  return (
    <div className="relative w-full mb-4" ref={ref}>
      <label className="block mb-1 text-md font-medium">{label}</label>

      {isEmpty ? (
        <div className="text-gray-400 px-3 py-2 border rounded bg-gray-50 select-none">
          список отсутствует
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full text-left px-3 py-2 border rounded bg-white text-black flex justify-between items-center"
        >
          {selected.length === 0 ? "Выбор" : `Выбрано: ${selected.length}`}
          <FiChevronDown
            className={`ml-2 transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      )}

      {isOpen && !isEmpty && (
        <div className="absolute left-0 mt-1 w-full bg-white border rounded shadow z-10 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <div
              key={option.id}
              onClick={() => toggleSelection(option.id)}
              className={`flex items-start gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                selected.includes(option.id) ? "bg-primary/10" : ""
              }`}
            >
              <div className="min-w-[20px] w-5 h-5 border rounded flex items-center justify-center bg-white mt-[2px]">
                {selected.includes(option.id) && (
                  <FiCheck className="text-primary text-md" />
                )}
              </div>
              <span className="text-md">{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
