import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Employee from "./pages/Employee";
import AdminLayout from "./layouts/AdminLayout";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={
        <AdminLayout>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/employees" element={<Employee />} />
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </AdminLayout>
      } />
    </Routes>
  );
}
