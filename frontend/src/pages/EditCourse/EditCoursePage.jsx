import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../../components/Header/Header'
import CourseForm from '../../components/CourseForm/CourseForm'
import styles from './EditCoursePage.module.css'

const EditCoursePage = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [courseData, setCourseData] = useState(null)
  
  useEffect(() => {
    // TODO: Здесь будет логика загрузки данных курса с бэкенда
    const fetchCourseData = async () => {
      try {
        setIsLoading(true)
        // Имитация загрузки данных
        setTimeout(() => {
          // Здесь будет реальный API-запрос
          const mockData = {
            id: courseId, // Добавляем ID для отслеживания изменений
            title: 'Название курса',
            category: 'programming',
            startDate: '2023-01-01',
            image: null
          }
          setCourseData(mockData)
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Error fetching course data:', error)
        setIsLoading(false)
      }
    }
    
    fetchCourseData()
  }, [courseId])

  const handleSubmit = (formData) => {
    // TODO: Здесь будет логика отправки данных на бэкенд
    console.log('Updated form data:', formData)
    navigate('/courses')
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Header />
        <main className="content-wrapper">
          <div className="page-header">
            <h1 className="page-title">Редактирование курса</h1>
          </div>
          <div className="loading">Загрузка...</div>
        </main>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Header />
      <main className="content-wrapper">
        <div className="page-header">
          <h1 className="page-title">Редактирование курса</h1>
        </div>
        <CourseForm 
          key={courseId} // Добавляем ключ для правильного обновления компонента
          initialData={courseData} 
          onSubmit={handleSubmit} 
          submitButtonText="Сохранить изменения"
        />
      </main>
    </div>
  )
}

export default EditCoursePage 