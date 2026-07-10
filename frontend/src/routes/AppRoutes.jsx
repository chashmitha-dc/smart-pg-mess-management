import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";

import DashboardLayout from "../layouts/DashboardLayout";

import Login from "../pages/login/login";
import Dashboard from "../pages/dashboard/dashboard";
import PG from "../pages/pg/pg";
import Members from "../pages/Members/Members";
import MealPlans from "../pages/mealplans/mealplans";
import MealPrice from "../pages/mealprice/mealprice";
import Leaves from "../pages/leaves/leaves";
import Reports from "../pages/reports/reports";
import Settings from "../pages/settings/settings";
import Billing from "../pages/billing/billing";
import Payments from "../pages/payments/payments";
import Complaints from "../pages/complaints/complaints";
import Notifications from "../pages/notification/notification";
import AI from "../pages/AI/AI";

// Member Portal Imports
import MemberLayout from "../layouts/MemberLayout";
import MemberDashboard from "../pages/member/dashboard";
import MemberProfile from "../pages/member/profile";
import MemberLeaves from "../pages/member/leaves";
import MemberBills from "../pages/member/bills";
import MemberComplaints from "../pages/member/complaints";
import MemberNotifications from "../pages/member/notifications";
import ChangePasswordPage from "../pages/login/ChangePasswordPage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/pg"
            element={<PG />}
          />

          <Route
            path="/members"
            element={<Members />}
          />

          <Route
            path="/meal-plans"
            element={<MealPlans />}
          />

          <Route
            path="/meal-price"
            element={<MealPrice />}
          />

          <Route
            path="/leaves"
            element={<Leaves />}
          />

          <Route
            path="/reports"
            element={<Reports />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />

          <Route
            path="/billing"
            element={<Billing />}
          />

          <Route
            path="/payments"
            element={<Payments />}
          />

          <Route
            path="/complaints"
            element={<Complaints />}
          />

          <Route
            path="/notifications"
            element={<Notifications />}
          />

          <Route
            path="/ai"
            element={<AI />}
          />
        </Route>

        {/* Member Portal Route */}
        <Route path="/member/login" element={<Login />} />

        {/* Protected Member Routes */}
        <Route
          element={
            <ProtectedRoute allowedRole="member">
              <MemberLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/member/dashboard" element={<MemberDashboard />} />
          <Route path="/member/profile" element={<MemberProfile />} />
          <Route path="/member/leaves" element={<MemberLeaves />} />
          <Route path="/member/bills" element={<MemberBills />} />
          <Route path="/member/complaints" element={<MemberComplaints />} />
          <Route path="/member/notifications" element={<MemberNotifications />} />
        </Route>

        <Route
          path="/member/change-password"
          element={
            <ProtectedRoute allowedRole="member">
              <ChangePasswordPage />
            </ProtectedRoute>
          }
        />

        {/* Redirect */}
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        {/* 404 */}
        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;