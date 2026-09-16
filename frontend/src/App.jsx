import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import StudentAssignments from "./pages/StudentAssignments";
import StudentSubjects from "./pages/StudentSubjects";
import StudentSubjectDetails from "./pages/StudentSubjectDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/student/assignments" element={<StudentAssignments />} />
        <Route path="/student/subjects" element={<StudentSubjects />} />
        
        <Route
          path="/student/subjects/:id"
          element={<StudentSubjectDetails />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
