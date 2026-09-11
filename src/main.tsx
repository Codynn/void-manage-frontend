import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App.tsx";
import { LoginPage } from "./pages/auth/LoginPage.tsx";
import RootLayout from "./components/layout/RootLayout.tsx";
import AdminDashboard from "./pages/home/AdminDashboard.tsx";
import AdminLeavePage from "./pages/leave/AdminLeavePage.tsx";
import LeaveLayout from "./components/layout/LeaveLayout.tsx";
import AdminProjectPage from "./pages/project/AdminProjectPage.tsx";
import CreateProject from "./pages/project/CreateProject.tsx";
import AdminViewProject from "./pages/project/AdminViewProject.tsx";
import DashboardLayout from "./components/layout/DashboardLayout.tsx";
import CreateTemplate from "./pages/contract/CreateTemplate.tsx";
import UsersPage from "./pages/user/UsersPage.tsx";
import UserViewPage from "./pages/user/UserViewPage.tsx";
import InternDashboard from "./pages/home/InternDashboard.tsx";
import InternTimePage from "./pages/time-tracking/InternTimePage.tsx";
import WelcomePhotos from "./pages/welcome/WelcomePhotos.tsx";
import InternContractPage from "./pages/contract/InternContractPage.tsx";
import InternLeavePage from "./pages/leave/InternLeavePage.tsx";
import MentorDashboard from "./pages/home/MentorDashboard.tsx";
import CreateTemplatePage from "./pages/milestone/CreateTemplatePage.tsx";
import TemplatesListPage from "./pages/milestone/TemplatesListPage.tsx";
import TemplateViewPage from "./pages/milestone/TemplateViewPage.tsx";
import InternMileStone from "./pages/milestone/InternMileStone.tsx";
import AdminTimeHistoryPage from "./pages/time-tracking/AdminTimeHistoryPage.tsx";
import AdminMilestone from "./pages/milestone/AdminMilestone.tsx";
import DailyChecklistPage from "./pages/milestone/DailyChecklistPage.tsx";
import CreateTaskPage from "./pages/milestone/CreateTaskPage.tsx";
import EditTaskPage from "./pages/milestone/EditTaskPage.tsx";
import AssignTaskPage from "@/pages/milestone/AssignTaskPage";
import MentorIndividualAssignment from "./pages/milestone/MentorIndividualAssignment.tsx";
import AdminTimesheetPage from "./pages/time-tracking/AdminTimesheetPage.tsx";
import AdminWorkingHoursRequestsPage from "./pages/time-tracking/AdminWorkingHoursRequestsPage.tsx";
import AdminDocumentsPage from "./pages/documents/AdminDocumentsPage.tsx";
import CreateCertificateTemplate from "./pages/certificate/CreateCertificateTemplate.tsx";
import InternCertificatesPage from "./pages/certificate/InternCertificatesPage.tsx";
import TemplatesPage from "./pages/templates/TemplatesPage.tsx";

const router = createBrowserRouter([
  {
    path: "",
    element: <RootLayout />,
    children: [
      {
        path: "",
        element: <App />,
      },
      {
        path: "auth",
        children: [
          {
            path: "login",
            element: <LoginPage />,
          },
        ],
      },
      {
        path: "admin",
        element: <DashboardLayout allowedRoles={["ADMIN"]} />,
        children: [
          {
            path: "dashboard",
            element: <AdminDashboard />,
          },
          {
            path: "leave",
            element: <LeaveLayout />,
            children: [
              {
                path: "",
                element: <AdminLeavePage />,
              },
              {
                path: ":id",
                element: <AdminLeavePage />,
              },
            ],
          },
          {
            path: "project",
            children: [
              {
                path: "",
                element: <AdminProjectPage />,
              },
              {
                path: "create",
                element: <CreateProject />,
              },
              {
                path: "edit/:projectId",
                element: <CreateProject />,
              },
              {
                path: ":projectId",
                element: <AdminViewProject />,
              },
            ],
          },
          {
            path: "templates",
            element: <TemplatesPage />,
          },
          {
            path: "contract",
            children: [
              {
                path: "create",
                element: <CreateTemplate />,
              },
              {
                path: "edit/:id",
                element: <CreateTemplate />,
              },
            ],
          },
          {
            path: "users",
            children: [
              {
                path: "",
                element: <UsersPage />,
              },
              {
                path: ":userId",
                element: <UserViewPage />,
              },
            ],
          },
          // ✅ NEW: Timesheets route
          {
            path: "timesheets",
            element: <AdminTimesheetPage />,
          },
          {
            path: "working-hours-requests",
            element: <AdminWorkingHoursRequestsPage />,
          },
          {
            path: "milestones",
            children: [
              {
                path: "",
                element: <AdminMilestone />,
              },
              {
                path: "tasks",
                element: <DailyChecklistPage />,
              },
              {
                path: "create-task",
                element: <CreateTaskPage />,
              },
              {
                path: "assign-task",
                element: <AssignTaskPage />,
              },
              {
                path: "templates",
                element: <TemplatesListPage />,
              },
              {
                path: "templates/:templateId",
                element: <TemplateViewPage />,
              },
              {
                path: "create-template",
                element: <CreateTemplatePage />,
              },
              {
                path: "edit-template/:templateId",
                element: <CreateTemplatePage />,
              },
              {
                path: "/admin/milestones/edit-task/:taskId",
                element: <EditTaskPage />,
              },
            ],
          },
          {
            path: "time-history/:userId",
            element: <AdminTimeHistoryPage />,
          },
          {
            path: "documents",
            element: <AdminDocumentsPage />,
          },
          {
            path: "certificates",
            children: [
              {
                path: "create",
                element: <CreateCertificateTemplate />,
              },
              {
                path: "edit/:id",
                element: <CreateCertificateTemplate />,
              },
            ],
          },
        ],
      },
      {
        path: "intern",
        element: <DashboardLayout allowedRoles={["INTERN"]} />,
        children: [
          {
            path: "dashboard",
            element: <InternDashboard />,
          },
          {
            path: "time-tracking",
            element: <InternTimePage />,
          },
          {
            path: "welcome-photos",
            element: <WelcomePhotos />,
          },
          {
            path: "contract",
            element: <InternContractPage />,
          },
          {
            path: "certificates",
            element: <InternCertificatesPage />,
          },
          {
            path: "leave",
            element: <InternLeavePage />,
          },
          {
            path: "milestones",
            element: <InternMileStone />,
          },
        ],
      },
      {
        path: "mentor",
        element: <DashboardLayout allowedRoles={["MENTOR"]} />,
        children: [
          {
            path: "dashboard",
            element: <MentorDashboard />,
          },
          {
            path: "time-tracking",
            element: <InternTimePage />,
          },
          {
            path: "welcome-photos",
            element: <WelcomePhotos />,
          },
          {
            path: "contract",
            element: <InternContractPage />,
          },
          {
            path: "leave",
            element: <InternLeavePage />,
          },
          {
            path: "user/:userId",
            element: <UserViewPage />,
          },
          {
            path: "project/:projectId",
            element: <AdminViewProject />,
          },
          {
            path: "individual-assignment",
            element: <MentorIndividualAssignment />,
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
