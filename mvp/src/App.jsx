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
import VerifyCode from './views/VerifyCode';

import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import ExamDetailStudent from './views/ExamDetailStudent';
import TeacherExamDetail from './views/TeacherExamDetail';
import TeacherExamStudentDetail from './views/TeacherExamStudentDetail';
function App() {
    const [count, setCount] = useState(0)

    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<VerifyCode />} />
            <Route path="/login/no-permission" element={<Login noPermission={true} />} />

            <Route path="/dashboard/admin" element={<ProtectedRoute> <RoleRoute allowedRoles={[1]}> <DashboardAdmin />   </RoleRoute> </ProtectedRoute>} />
            <Route path="/dashboard/teacher" element={<ProtectedRoute> <RoleRoute allowedRoles={[2]}> <DashboardTeacher /> </RoleRoute> </ProtectedRoute>} />
            <Route path="/dashboard/student" element={<ProtectedRoute> <RoleRoute allowedRoles={[3]}> <DashboardStudent /> </RoleRoute> </ProtectedRoute>} />

            <Route path="/databases" element={<ProtectedRoute> <RoleRoute allowedRoles={[1, 2]}> <DatabasesList /> </RoleRoute> </ProtectedRoute>} />
            <Route path="/student/:id" element={<ProtectedRoute> <StudentDetail /> </ProtectedRoute>} />
            <Route path="/students" element={<ProtectedRoute> <RoleRoute allowedRoles={[1, 2]}> <StudentsList /> </RoleRoute> </ProtectedRoute>} />
            <Route path="/teacher/:id" element={<ProtectedRoute> <RoleRoute allowedRoles={[1, 2]}> <TeacherDetail /> </RoleRoute> </ProtectedRoute>} />
            <Route path="/exam/create" element={<ProtectedRoute> <RoleRoute allowedRoles={[1, 2]}> <CreateExam /> </RoleRoute> </ProtectedRoute>} />
            <Route path="/exam/take" element={<ProtectedRoute> <RoleRoute allowedRoles={[1, 3]}> <ExamEvaluator /> </RoleRoute> </ProtectedRoute>} />
            
            <Route path="/exams/:id" element={<ExamDetailStudent />} />
            <Route path="/teacher/exams/:id" element={<TeacherExamDetail />} />
            <Route path="/teacher/exams/:examId/students/:studentId" element={<TeacherExamStudentDetail />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App
