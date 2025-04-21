import React from "react";
import { StudentCardInfoDto } from "./StudentList";

interface Props {
  student: StudentCardInfoDto;
  onDelete: () => void;
  onOpen: () => void;
}

const StudentCard: React.FC<Props> = ({ student, onDelete, onOpen }) => {
  return (
    <div className="flex items-center justify-between border-b py-2 px-3 bg-primary/10 rounded mb-2">
      <div className="cursor-pointer" onClick={onOpen}>
        <p className="font-semibold text-sm">
          id:{student.studentId} – {student.login}
        </p>
        <p className="text-xs text-gray-600">
          {student.lastActiveAt ?? "неактивен"}
        </p>
      </div>
      <button
        onClick={onDelete}
        className="bg-red-200 hover:bg-red-300 text-red-900 px-3 py-1 rounded"
      >
        ❌
      </button>
    </div>
  );
};

export default StudentCard;
