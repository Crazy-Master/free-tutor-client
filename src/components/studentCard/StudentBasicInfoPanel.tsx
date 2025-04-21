import { StudentCardInfoDto } from "../../store/studentStore";

interface Props {
  studentCard: StudentCardInfoDto;
}

const StudentBasicInfoPanel: React.FC<Props> = ({ studentCard }) => {
  return (
    <div className="p-4 border rounded shadow bg-white">
      <h2 className="text-xl font-semibold mb-2">Информация о студенте</h2>
      <p><strong>ID:</strong> {studentCard.studentId}</p>
      <p><strong>Логин:</strong> {studentCard.login}</p>
      <p><strong>Последняя активность:</strong> {studentCard.lastActiveAt ?? "Нет данных"}</p>
    </div>
  );
};

export default StudentBasicInfoPanel;
