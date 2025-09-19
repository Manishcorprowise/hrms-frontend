import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import UserProfile from "./pages/UserProfile";
import UserProfileEdit from "./pages/UserProfile/UserProfileEdit";
import Employee from "./pages/EmployeePage/Employee";

export default function App() {
  const { isAuthenticated, user } = useSelector(state => state.auth);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <AdminLayout>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/employees" element={
                <ProtectedRoute requiredRoles={['admin', 'super_admin','manager']}>
                  <Employee />
                </ProtectedRoute>
              } />
              <Route path="/" element={<Dashboard />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/profile/:userId" element={<UserProfile />} />
              <Route path="/profile/edit" element={<UserProfileEdit />} />
            </Routes>
          </AdminLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}
