import { RouteObject } from "react-router-dom";

import LoginPage from "../pages/LoginPage";
import RegistrationPage from "../pages/RegistrationPage";
import TeacherPage from "../pages/TeacherPage";
import StudentPage from "../pages/StudentPage";
import AdminPage from "../pages/AdminPage";
import StudentInfoPage from "../pages/StudentInfoPage";

import ProtectedRoute from "../lib/ProtectedRoute";
import Layout from "../components/Layout";
import RouteGuard from "../lib/RouteGuard";

export const appRoutes: RouteObject[] = [
  {
    path: "/",
    element: <ProtectedRoute><></></ProtectedRoute>,
  },

  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegistrationPage /> },

  {
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/teacher",
        element: (
          <RouteGuard role="teacher">
            <TeacherPage />
          </RouteGuard>
        ),
      },
      {
        path: "/student",
        element: (
          <RouteGuard role="student">
            <StudentPage />
          </RouteGuard>
        ),
      },
      {
        path: "/admin",
        element: (
          <RouteGuard role="admin">
            <AdminPage />
          </RouteGuard>
        ),
      },
    ],
  },

  { path: "/student/:studentId", element: <StudentInfoPage /> },
];
