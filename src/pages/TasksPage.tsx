import React, { useState } from "react";
import TaskFilterPanel from "../components/tasks/TaskFilterPanel";
import TaskList, { Task } from "../components/tasks/TaskList";
import Pagination from "../components/common/Pagination";
import { TaskDto, TaskFilterDto, PagedResultDto } from "../types/api-types";
import { mapTaskDtoToCardTask } from "../lib/mapTaskDtoToCardTask";
import { api } from "../lib/api";

const TasksPage: React.FC = () => {


  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<TaskFilterDto | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchTasks = async (customFilter?: TaskFilterDto) => {
    const usedFilter = customFilter ?? filter;
    if (!usedFilter) return;

    try {
      setLoading(true);
      const result: PagedResultDto<TaskDto> = await api.getTasks(usedFilter);
      setTasks(result.items.map(mapTaskDtoToCardTask));
      const total = Math.ceil(result.totalCount / result.pageSize);
      setTotalPages(total);
      setCurrentPage(result.pageNumber);
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
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    if (!filter) return;
    const updatedFilter = { ...filter, pageNumber: page };
    setFilter(updatedFilter);
    fetchTasks(updatedFilter);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col pb-20">

      <main className="flex-1 p-6 space-y-4">
        <TaskFilterPanel onSearch={handleSearch} onReset={handleReset} />
        <TaskList tasks={tasks} loading={loading} />
      </main>

      {tasks.length > 0 && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
        />
      )}
    </div>
  );
};

export default TasksPage;