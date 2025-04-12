import React from "react";

interface Option {
  id: number;
  label: string;
  color?: string;
}

interface Props {
  options: Option[];
  selected: number[];
  onChange: (newSelected: number[]) => void;
  label: string;
}

const MultiSelectDropdown: React.FC<Props> = ({ options, selected, onChange, label }) => {
  const toggle = (id: number) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <label className="block mb-1 font-medium">{label}</label>
      <div className="border rounded p-2 space-y-1 max-h-40 overflow-y-auto">
        {options.map((option) => (
          <div key={option.id} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(option.id)}
              onChange={() => toggle(option.id)}
            />
            <span
              className="text-sm"
              style={option.color ? { color: option.color } : undefined}
            >
              {option.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiSelectDropdown;
