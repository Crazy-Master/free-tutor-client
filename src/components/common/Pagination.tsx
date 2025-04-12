import React, { useState } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const [inputPage, setInputPage] = useState(currentPage);

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const page = Math.max(1, Math.min(totalPages, inputPage));
      onPageChange(page);
    }
  };

  const handleBlur = () => setInputPage(currentPage);

  return (
    <div className="flex items-center justify-center gap-3 mt-6 text-sm">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        ←
      </button>

      <input
        type="number"
        value={inputPage}
        onChange={(e) => setInputPage(Number(e.target.value))}
        onKeyDown={handleEnter}
        onBlur={handleBlur}
        className="border px-2 py-1 rounded w-16 text-center"
        min={1}
        max={totalPages}
      />

      <span>из {totalPages}</span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        →
      </button>
    </div>
  );
};

export default Pagination;
