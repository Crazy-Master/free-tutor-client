import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import TasksPage from "./pages/TasksPage";
import RegistrationPage from "./pages/RegistrationPage";
import ProtectedRoute from "./lib/ProtectedRoute";
import StudentPage from "./pages/StudentPage";
import TeacherPage from "./pages/TeacherPage";
import AdminPage from "./pages/AdminPage";
import Layout from "./components/Layout";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/student" element={<StudentPage />} />
        <Route path="/teacher" element={<TeacherPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Route>
    </Routes>
  );
}

export default App;
