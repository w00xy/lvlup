import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header/Header'
import CourseForm from '../../components/CourseForm/CourseForm'
import { createCourse } from '../../services/courseService'
import styles from './CreateCoursePage.module.css'

const CreateCoursePage = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  
  // Получаем сегодняшнюю дату для initialData
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const initialData = {
    title: '',
    category_id: '',
    startDate: getTodayDate(),
    image: null
  };

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true)
      setError(null)
      
      // Отправляем данные на сервер
      const newCourse = await createCourse(formData)
      
      console.log('Курс успешно создан:', newCourse)
      
      // Перенаправляем на страницу с курсами
      navigate('/courses')
    } catch (err) {
      console.error('Ошибка при создании курса:', err)
      setError(
        err.response?.data?.detail || 
        'Произошла ошибка при создании курса. Пожалуйста, попробуйте еще раз.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.container}>
      <Header />
      <main className="content-wrapper">
        <h1 className="page-title add-top-margin">Создание курса</h1>
        
        {error && (
          <div className={styles.errorAlert}>
            {error}
          </div>
        )}
        
        <CourseForm 
          initialData={initialData}
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting}
        />
      </main>
    </div>
  )
}

export default CreateCoursePage 