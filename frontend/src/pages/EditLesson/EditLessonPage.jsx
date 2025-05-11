import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../../components/Header/Header'
import LessonForm from '../../components/LessonForm/LessonForm'
import { updateLesson, getLessonById, deleteLesson } from '../../services/lessonService'
import { getCourseData } from '../../services/courseService'
import { FaArrowLeft, FaTrash } from 'react-icons/fa'
import styles from './EditLessonPage.module.css'

const EditLessonPage = () => {
  const { courseId, lessonId } = useParams()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState(null)
  const [course, setCourse] = useState(null)
  const [lesson, setLesson] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  // Загружаем информацию о курсе и уроке
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Параллельные запросы для данных курса и урока
        const [courseData, lessonData] = await Promise.all([
          getCourseData(courseId),
          getLessonById(lessonId)
        ]);
        
        setCourse(courseData)
        
        // Преобразуем данные урока в формат, понятный для формы
        const formattedLessonData = {
          lesson_num: lessonData.lesson_num,
          description: lessonData.description || '',
          image: lessonData.lesson_image ? `${import.meta.env.VITE_API_URL || ''}/${lessonData.lesson_image}` : null,
          course_id: courseId
        }
        
        setLesson(formattedLessonData)
        
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err)
        setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [courseId, lessonId])

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true)
      setError(null)
      
      // Отправляем данные на сервер
      const updatedLesson = await updateLesson(lessonId, formData)
      
      console.log('Урок успешно обновлен:', updatedLesson)
      
      // Перенаправляем на страницу урока
      navigate(`/courses/${courseId}/lessons/${lessonId}`)
    } catch (err) {
      console.error('Ошибка при обновлении урока:', err)
      setError(
        err.response?.data?.detail || 
        'Произошла ошибка при обновлении урока. Пожалуйста, попробуйте еще раз.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false)
  }

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteLesson(lessonId)
      navigate(`/courses/${courseId}`)
    } catch (err) {
      console.error('Ошибка при удалении урока:', err)
      setError(
        err.response?.data?.detail || 
        'Произошла ошибка при удалении урока. Пожалуйста, попробуйте еще раз.'
      )
      setShowDeleteConfirm(false)
    } finally {
      setIsDeleting(false)
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

  if (!course || !lesson) {
    return (
      <div className={styles.container}>
        <Header />
        <main className="content-wrapper">
          <div className="error">Урок или курс не найден</div>
          <button 
            className={styles.backButton}
            onClick={() => navigate(`/courses/${courseId}`)}
          >
            Вернуться к курсу
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Header />
      <main className="content-wrapper">
        <div className={styles.pageHeader}>
          <button 
            className={styles.backButton}
            onClick={() => navigate(`/courses/${courseId}/lessons/${lessonId}`)}
          >
            <FaArrowLeft /> Вернуться к уроку
          </button>
          <h1 className={styles.pageTitle}>Редактирование урока #{lesson.lesson_num}</h1>
        </div>
        
        {error && (
          <div className={styles.errorAlert}>
            {error}
          </div>
        )}
        
        <div className={styles.courseInfo}>
          <p>Курс: <strong>{course.course_name}</strong></p>
        </div>

        <div className={styles.actionsPanel}>
          <button 
            className={styles.deleteButton}
            onClick={handleDeleteClick}
            disabled={isDeleting}
          >
            <FaTrash /> {isDeleting ? 'Удаление...' : 'Удалить урок'}
          </button>
        </div>
        
        {showDeleteConfirm && (
          <div className={styles.deleteConfirmOverlay}>
            <div className={styles.deleteConfirmDialog}>
              <h3>Удалить урок?</h3>
              <p>Это действие невозможно отменить. Урок будет полностью удалён из курса.</p>
              <div className={styles.deleteConfirmButtons}>
                <button className={styles.cancelButton} onClick={handleCancelDelete}>
                  Отмена
                </button>
                <button 
                  className={styles.confirmDeleteButton} 
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Удаление...' : 'Удалить'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        <LessonForm 
          initialData={lesson}
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting}
          submitButtonText="Сохранить изменения"
        />
      </main>
    </div>
  )
}

export default EditLessonPage 