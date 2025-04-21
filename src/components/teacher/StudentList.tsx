import React from "react";
import PopupConfirm from "../ui/PopupConfirm";
import StudentCard from "./StudentCard";

export interface StudentCardInfoDto {
  id: number;
  studentId: number;
  login: string;
  lastActiveAt: string | null;
}

interface StudentListProps {
  title?: string;
  loading?: boolean;
  students: StudentCardInfoDto[];
  onDelete: (id: number) => void;
  onOpenStudent: (studentId: number) => void;
  footer?: React.ReactNode;
  maxHeight?: string;
}

const StudentList: React.FC<StudentListProps> = ({
  title = "Список учеников",
  loading = false,
  students,
  onDelete,
  onOpenStudent,
  footer,
  maxHeight = "400px",
}) => {
  const [toDelete, setToDelete] = React.useState<StudentCardInfoDto | null>(null);

  return (
    <div className="space-y-4">
      {title && <h2 className="text-xl font-bold">{title}</h2>}

      {loading ? (
        <p>Загрузка учеников...</p>
      ) : (
        <div
          className={`border rounded p-4 relative ${students.length > 4 ? "overflow-y-auto" : ""}`}
          style={{ maxHeight }}
        >
          {students.length === 0 ? (
            <p className="text-sm text-gray-500">Нет добавленных учеников</p>
          ) : (
            students.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                onDelete={() => setToDelete(student)}
                onOpen={() => onOpenStudent(student.studentId)}
              />
            ))
          )}

          {toDelete && (
            <PopupConfirm
              message={`Удалить ученика ${toDelete.login}?`}
              onConfirm={() => {
                onDelete(toDelete.id);
                setToDelete(null);
              }}
              onCancel={() => setToDelete(null)}
            />
          )}

          {footer && (
            <div className="sticky bottom-0 left-0 bg-background pt-4 pb-2 mt-4 border-t">
              {footer}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentList;
