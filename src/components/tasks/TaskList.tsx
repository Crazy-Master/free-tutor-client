import React from "react";
import TaskCardBase from "../task/TaskCardBase";
import { AnswerTask } from "../../types/answer";

export interface Task {
  taskId: number;
  tagIds: number[];
  testNumber?: string;
  textContent?: string;
  imageContent?: { imageBase64: string } | null;
  shortAnswer?: number;
  answerTask?: AnswerTask | null;
  topics: string[];
  answerType: string;
  groupNumber?: number;
  year: number;
  relevance: string;
}

interface TaskListProps {
  tasks: Task[];
  loading?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, loading = false }) => {
  if (loading) {
    return <p className="text-center py-10 text-sm text-gray-600">Загрузка задач...</p>;
  }

  if (!tasks || tasks.length === 0) {
    return <p className="text-center py-10 text-sm text-gray-500">Задания не найдены</p>;
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskCardBase key={task.taskId} {...task} />
      ))}
    </div>
  );
};

export default TaskList;
