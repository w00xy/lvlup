import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../../components/Header/Header'
import LessonForm from '../../components/LessonForm/LessonForm'
import { createLesson, getNextLessonNumber } from '../../services/lessonService'
import { getCourseData } from '../../services/courseService'
import styles from './CreateLessonPage.module.css'

const CreateLessonPage = () => {
  const { courseId } = useParams() // Получаем ID курса из URL
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [course, setCourse] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [initialData, setInitialData] = useState({
    lesson_num: '',
    description: '',
    image: null,
    course_id: courseId
  })
  
  // Загружаем информацию о курсе и следующий номер урока
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Параллельные запросы для данных курса и следующего номера урока
        const [courseData, nextLessonNum] = await Promise.all([
          getCourseData(courseId),
          getNextLessonNumber(courseId)
        ]);
        
        setCourse(courseData)
        
        // Устанавливаем initialData с полученным номером урока
        setInitialData(prev => ({
          ...prev,
          lesson_num: nextLessonNum
        }))
        
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err)
        setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [courseId])

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true)
      setError(null)
      
      // Отправляем данные на сервер
      const newLesson = await createLesson(formData)
      
      console.log('Урок успешно создан:', newLesson)
      
      // Перенаправляем на страницу курса
      navigate(`/courses/${courseId}`)
    } catch (err) {
      console.error('Ошибка при создании урока:', err)
      setError(
        err.response?.data?.detail || 
        'Произошла ошибка при создании урока. Пожалуйста, попробуйте еще раз.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Header />
        <main className="content-wrapper">
          <div className="loading">Загрузка...</div>
        </main>
      </div>
    )
  }

  if (!course) {
    return (
      <div className={styles.container}>
        <Header />
        <main className="content-wrapper">
          <div className="error">Курс не найден</div>
          <button 
            className={styles.backButton}
            onClick={() => navigate('/courses')}
          >
            Вернуться к списку курсов
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Header />
      <main className="content-wrapper">
        <div className="page-header">
          <h1 className="page-title">Добавление урока в курс "{course.course_name}"</h1>
        </div>
        
        {error && (
          <div className={styles.errorAlert}>
            {error}
          </div>
        )}
        
        <LessonForm 
          initialData={initialData}
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting}
          lessonNumInfo={
            <div className={styles.lessonNumberInfo}>
              <p>Рекомендуемый номер урока: <strong>{initialData.lesson_num}</strong></p>
              <p className={styles.lessonNumberNote}>Вы можете изменить этот номер при необходимости</p>
            </div>
          }
        />
      </main>
    </div>
  )
}

export default CreateLessonPage 