import Header from "../components/Header";

const TasksPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="p-10">
        <h1 className="text-2xl font-bold">Добро пожаловать в список задач!</h1>
      </div>
    </div>
  );
};

export default TasksPage;
