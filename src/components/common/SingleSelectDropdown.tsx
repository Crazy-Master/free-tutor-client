import React, { useRef, useState, useEffect } from "react";
import { FiChevronDown, FiCheck } from "react-icons/fi";

export interface Option {
  id: number;
  label: string;
  disabled?: boolean;
}

interface Props {
  label: string;
  options: Option[];
  selected: number | null;
  onChange: (id: number | null) => void;
  placeholder?: string;
}

const SingleSelectDropdown: React.FC<Props> = ({ label, options, selected, onChange }) => {
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

  const handleSelect = (id: number) => {
    onChange(id);
    setIsOpen(false);
  };

  const selectedLabel = options.find((o) => o.id === selected)?.label ?? "Выбор";
  const isEmpty = options.length === 1 && options[0].disabled;

  return (
    <div className="relative w-full mb-4" ref={ref}>
      <label className="block mb-1 text-sm font-medium">{label}</label>

      {isEmpty ? (
        <div className="text-gray-400 px-3 py-2 border rounded bg-gray-50 cursor-not-allowed select-none">
          список отсутствует
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full text-left px-3 py-2 border rounded bg-white text-black flex justify-between items-center"
        >
          {selectedLabel}
          <FiChevronDown className={`ml-2 transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      )}

      {isOpen && !isEmpty && (
        <div className="absolute left-0 mt-1 w-full bg-white border rounded shadow z-10 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <div
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                selected === option.id ? "bg-primary/10" : ""
              }`}
            >
              {selected === option.id && (
                <FiCheck className="text-primary text-sm" />
              )}
              <span className="text-sm">{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SingleSelectDropdown;
