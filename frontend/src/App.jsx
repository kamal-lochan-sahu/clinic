import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Layout from "./components/common/Layout";
import ProtectedRoute from "./components/common/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Patients from "./pages/patients/Patients";
import AddPatient from "./pages/patients/AddPatient";
import PatientDetail from "./pages/patients/PatientDetail";
import EditPatient from "./pages/patients/EditPatient";
import Appointments from "./pages/appointments/Appointments";
import BookAppointment from "./pages/appointments/BookAppointment";
import AppointmentDetail from "./pages/appointments/AppointmentDetail";
import Queue from "./pages/queue/Queue";
import OPD from "./pages/opd/OPD";
import Consultation from "./pages/opd/Consultation";
import LabTests from "./pages/labtests/LabTests";
import Medicines from "./pages/medicines/Medicines";
import Billing from "./pages/billing/Billing";
import CreateBill from "./pages/billing/CreateBill";
import BillingDetail from "./pages/billing/BillingDetail";
import Staff from "./pages/staff/Staff";
import Expenses from "./pages/expenses/Expenses";
import Analytics from "./pages/analytics/Analytics";
import Settings from "./pages/Settings";

// Apply brand color from user settings
const applyBrandColor = (color) => {
  if (!color) return;
  const root = document.documentElement;
  // Convert hex to RGB for Tailwind CSS variable
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  root.style.setProperty("--color-primary", `${r} ${g} ${b}`);
  root.style.setProperty("--brand-color", color);
};

export default function App() {
  const { isAuthenticated, user } = useAuthStore();

  // Apply brand color whenever user changes
  useEffect(() => {
    if (user?.branding?.primaryColor) {
      applyBrandColor(user.branding.primaryColor);
    }
  }, [user?.branding?.primaryColor]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />

        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />

          {/* Patients */}
          <Route path="patients" element={<Patients />} />
          <Route path="patients/new" element={<AddPatient />} />
          <Route path="patients/:id" element={<PatientDetail />} />
          <Route path="patients/:id/edit" element={<EditPatient />} />

          {/* Appointments */}
          <Route path="appointments" element={<Appointments />} />
          <Route path="appointments/new" element={<BookAppointment />} />
          <Route path="appointments/:id" element={<AppointmentDetail />} />

          {/* Queue */}
          <Route path="queue" element={<Queue />} />

          {/* OPD */}
          <Route path="opd" element={<OPD />} />
          <Route path="opd/consultation/:patientId" element={<Consultation />} />

          {/* Other */}
          <Route path="labtests" element={<LabTests />} />
          <Route path="medicines" element={<Medicines />} />
          <Route path="billing" element={<Billing />} />
          <Route path="billing/new" element={<CreateBill />} />
          <Route path="billing/:id" element={<BillingDetail />} />
          <Route path="staff" element={<Staff />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
