import { useUser } from "../store/user";

const AdminPage = () => {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-background text-text p-6">
      <h2 className="text-2xl font-bold mb-4">🛠 Панель администратора</h2>
      <p>Email: {user?.email}</p>
    </div>
  );
};

export default AdminPage;
