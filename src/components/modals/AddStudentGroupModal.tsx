import { useRef, useState, useEffect } from "react";
import { useUserInfoFromToken } from "../../hooks/useUserInfoFromToken";
import { api } from "../../lib/api";
import { StudentCardInfoDto } from "../../types/api-types";
import PopupConfirm from "../ui/PopupConfirm";
import ErrorBox from "../ui/ErrorBox";


interface Props {
  disciplineId: number;
  onClose: () => void;
  onSuccess?: (newStudent: StudentCardInfoDto) => void;
}

const AddStudentGroupModal = ({ disciplineId, onClose, onSuccess }: Props) => {
  const userInfo = useUserInfoFromToken();
  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showFullError, setShowFullError] = useState(false);

  useEffect(() => {
    if (success && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const parsedId = Number(studentId);
    if (!parsedId || parsedId <= 0) {
      setError("Введите корректный ID студента.");
      return;
    }

    if (!userInfo?.userId) {
      setError("Не удалось определить ID преподавателя.");
      return;
    }

    try {
      setLoading(true);
      const newStudent = await api.postStudentLink({
        studentId: parsedId,
        teacherId: userInfo.userId,
        disciplineId,
        information: { notes: {} },
      });

      setSuccess(true);
      onSuccess?.(newStudent);
      setTimeout(onClose, 1000);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm pointer-events-auto">
      <div
        className="bg-background p-6 rounded shadow-xl w-full max-w-sm relative"
        ref={scrollRef}
      >
        <h3 className="text-xl font-bold mb-4 text-center">Добавить ученика</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="number"
            placeholder="ID студента"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />

          {/* Сообщение об ошибке/успехе с ограничением */}
          {(error || success) && <ErrorBox message={error} />}

          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-secondary_other rounded hover:bg-gray-300"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-text_light rounded hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Добавление..." : "Добавить"}
            </button>
          </div>
        </form>

        {showFullError && (
          <PopupConfirm
            message={error}
            onConfirm={() => setShowFullError(false)}
            onCancel={() => setShowFullError(false)}
          />
        )}
      </div>
    </div>
  );
};

export default AddStudentGroupModal;
