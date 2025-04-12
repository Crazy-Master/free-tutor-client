import React, { useState } from "react";
import Header from "../components/Header";
import TaskFilterPanel from "../components/tasks/TaskFilterPanel";
import TaskList, { Task } from "../components/tasks/TaskList";
import Pagination from "../components/common/Pagination";
import { useNavigate } from "react-router-dom";
import { useUserInfoFromToken } from "../hooks/useUserInfoFromToken";
import { TaskDto, TaskFilterDto, PagedResultDto } from "../types/api-types";
import { mapTaskDtoToCardTask } from "../lib/mapTaskDtoToCardTask";
import { api } from "../lib/api";

const TasksPage: React.FC = () => {
  const navigate = useNavigate();
  const userInfo = useUserInfoFromToken();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<TaskFilterDto | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTasks = async (customFilter?: TaskFilterDto) => {
    const usedFilter = customFilter ?? filter;
    if (!usedFilter) return;

    try {
      setLoading(true);
      const result: PagedResultDto<TaskDto> = await api.getTasks(usedFilter);
      setTasks(result.items.map(mapTaskDtoToCardTask));

      const total = Math.ceil(result.totalCount / result.pageSize);
      setTotalPages(total);
    } catch (e) {
      console.error("Ошибка загрузки задач:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (filterDto: TaskFilterDto) => {
    setFilter(filterDto);
    fetchTasks(filterDto);
  };

  const handleReset = () => {
    setFilter(null);
    setTasks([]);
    setTotalPages(1);
  };

  const goToPage = (page: number) => {
    if (!filter) return;
    fetchTasks({ ...filter, pageNumber: page });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header showBackButton onBack={() => navigate(-1)} userInfo={userInfo} />

      <main className="flex-1 p-6 space-y-4">
        <TaskFilterPanel onSearch={handleSearch} onReset={handleReset} />
        <TaskList tasks={tasks} loading={loading} />
      </main>

      {tasks.length > 0 && totalPages > 1 && (
        <div className="p-4 border-t">
          <Pagination
            currentPage={filter?.pageNumber ?? 1}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        </div>
      )}
    </div>
  );
};

export default TasksPage;
