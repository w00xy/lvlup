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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<HelloPage />} />
        <Route path='/login' element={<AufPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/courses' element={<CoursesPage />} />
        <Route path='/courses/create' element={<CreateCoursePage />} />
        <Route path='/courses/:id' element={<CoursePage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
