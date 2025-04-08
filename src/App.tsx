import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import TasksPage from "./pages/TasksPage";
import RegistrationPage from "./pages/RegistrationPage";
import ProtectedRoute from "./lib/ProtectedRoute";
import StudentPage from "./pages/StudentPage";
import TeacherPage from "./pages/TeacherPage";
import AdminPage from "./pages/AdminPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
  <Route path="/register" element={<RegistrationPage />} />
  <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
  <Route path="/student" element={<ProtectedRoute><StudentPage /></ProtectedRoute>} />
  <Route path="/teacher" element={<ProtectedRoute><TeacherPage /></ProtectedRoute>} />
  <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
