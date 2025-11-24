import { useState } from 'react'

import './App.css'
import { Routes, Route } from "react-router-dom";
import { LandingPage } from './views/LandingPage'
import Register from './views/Register'
import Login from './views/Login'
import DashboardAdmin from './views/DashboardAdmin';
import DashboardStudent from './views/DashboardStudent';
import DashboardTeacher from './views/DashboardTeacher';
import DatabasesList from './views/DatabasesList';
import StudentDetail from './views/StudentDetail';
import StudentsList from './views/StudentsList';
import TeacherDetail from './views/TeacherDetail';
import CreateExam from './views/CreateExam';
import ExamEvaluator from './views/ExamEvaluator';
import NotFound from './views/NotFound';
function App() {
  const [count, setCount] = useState(0)

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard/admin" element={<DashboardAdmin />} />
      <Route path="/dashboard/student" element={<DashboardStudent />} />
      <Route path="/dashboard/teacher" element={<DashboardTeacher />} />
      <Route path="/databases" element={<DatabasesList />} />
      <Route path="/student/:id" element={<StudentDetail />} />
      <Route path="/students" element={<StudentsList />} />
      <Route path="/teacher/:id" element={<TeacherDetail />} />
      <Route path="/exam/create" element={<CreateExam />} />
      <Route path="/exam/take" element={<ExamEvaluator />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App
