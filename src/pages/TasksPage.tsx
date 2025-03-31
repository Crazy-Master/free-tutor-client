import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import TaskCard from "../components/TaskCard";
import { useAuth } from "../store/auth";

interface ImageData {
  imageBase64: string;
}

interface AnswerTask {
  shortAnswer?: number;
}

interface Task {
  taskId: number;
  taskIdExternal: string;
  textContent?: string;
  imageContent?: ImageData;
  problemSolving?: AnswerTask;
  typeResponseId?: number;
  groupNumber?: number;
  year?: string;
  relevance?: boolean;
  resource?: string;
  testNumber?: string;
  tagIds?: number[];
  topicIds?: number[];
}

const TasksPage: React.FC = () => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("https://api-tutor-master.ru/api/tasks", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Ошибка при загрузке задач");

        const data = await response.json();
        setTasks(data);
      } catch (err) {
        setError("Не удалось загрузить задачи");
        console.error(err);
      }
    };

    fetchTasks();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="max-w-4xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Список задач</h2>

        {error && <p className="text-red-600">{error}</p>}

        {tasks.map((task) => {
          console.log("🖼️ imageContent:", task.imageContent?.imageBase64);

          return (
            <TaskCard
              key={task.taskId}
              title={task.taskIdExternal}
              testNumbers={task.testNumber ? [task.testNumber] : []}
              textContent={task.textContent}
              imageContent={task.imageContent}
              type={task.typeResponseId?.toString()}
              groupNumber={task.groupNumber}
              year={task.year?.substring(0, 4)}
              relevance={task.relevance}
              resource={task.resource}
              tagNames={["Пример тега"]}
              topicNames={["Пример темы"]}
              shortAnswer={task.problemSolving?.shortAnswer}
            />
          );
        })}
      </div>
    </div>
  );
};

export default TasksPage;
