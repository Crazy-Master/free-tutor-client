import { useUser } from "../store/user";

const StudentPage = () => {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-background text-text p-6">
      <h2 className="text-2xl font-bold mb-4">👨‍🎓 Добро пожаловать, студент!</h2>
      <p>Email: {user?.email}</p>
      <p>Дисциплина ID: {user?.information.lastDisciplineId}</p>
    </div>
  );
};

export default StudentPage;
