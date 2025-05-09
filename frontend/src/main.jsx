import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './reset.css'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { Routes, Route } from 'react-router-dom'
import HelloPage from './pages/Hello/HelloPage.jsx'
import AufPage from './pages/Auth/AufPage.jsx'
import RegisterPage from './pages/Register/RegisterPage.jsx'
import CoursesPage from './pages/Courses/CoursesPage.jsx'
import CreateCoursePage from './pages/CreateCourse/CreateCoursePage.jsx'
import CoursePage from './pages/Course/CoursePage.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import SettingsPage from './pages/Settings/SettingsPage.jsx'
import ReportsPage from './pages/Reports/ReportsPage.jsx'

// Создаем компонент-обертку для главной страницы
const HomePage = () => {
  // Проверяем наличие токена
  const isAuthenticated = document.cookie.includes('access_token=');

  // Если пользователь авторизован, показываем CoursesPage
  // В противном случае показываем HelloPage
  return isAuthenticated ? <CoursesPage /> : <HelloPage />;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Обновляем корневой роут */}
        <Route path='/' element={<HomePage />} />
        <Route path='/login' element={<AufPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route 
          path="/courses" 
          element={
            <ProtectedRoute>
              <CoursesPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path='/courses/create' 
          element={
            <ProtectedRoute>
              <CreateCoursePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path='/courses/:id' 
          element={
            <ProtectedRoute>
              <CoursePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path='/reports' 
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path='/settings' 
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
