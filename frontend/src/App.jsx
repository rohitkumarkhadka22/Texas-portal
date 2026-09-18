import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import StudentDashboard from "./pages/StudentDashboard";
import StudentSubjects from "./pages/StudentSubjects";
import StudentAttendance from "./pages/StudentAttendance";
import StudentAssignments from "./pages/StudentAssignments";
import StudentResults from "./pages/StudentResults";
import StudentTimetable from "./pages/StudentTimetable";
import StudentProfile from "./pages/StudentProfile";

import StudentLayout from "./layouts/StudentLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* AUTH */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* STUDENT PORTAL */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<StudentDashboard />} />

          <Route path="subjects" element={<StudentSubjects />} />

          <Route path="attendance" element={<StudentAttendance />} />

          <Route path="assignments" element={<StudentAssignments />} />
          <Route path="results" element={<StudentResults />} />
          <Route path="timetable" element={<StudentTimetable />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
