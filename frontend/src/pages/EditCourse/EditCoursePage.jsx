import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/Header/Header'
import CourseForm from '../../components/CourseForm/CourseForm'
import { getCourseData, updateCourse } from '../../services/courseService'
import { FaArrowLeft } from 'react-icons/fa'
import { API_URL } from '../../config/api'
import styles from './EditCoursePage.module.css'

const EditCoursePage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [courseData, setCourseData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Добавляем useRef для файлового инпута
  const fileInputRef = useRef(null);

  // Обработчик выбора файла - сохраняем файл в отдельное состояние
  const [newImageFile, setNewImageFile] = useState(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Получаем данные курса, используя id из параметров маршрута
        const data = await getCourseData(id)
        
        // Проверяем, что получены корректные данные
        if (!data || typeof data !== 'object') {
          throw new Error('Получены некорректные данные курса')
        }
        
        // Преобразуем данные для формы
        const formattedData = {
          title: data.course_name || '',
          category_id: data.category_id || '',
          startDate: data.start_date ? data.start_date.split('T')[0] : '', // Извлекаем только дату
          // Исправляем URL изображения - не добавляем API_URL, если уже полный путь
          image: data.image_url ? (data.image_url.startsWith('http') 
            ? data.image_url 
            : `${API_URL}/${data.image_url.replace(/^\//, '')}`) : null
        }
        
        setCourseData(formattedData)
      } catch (err) {
        console.error('Ошибка при загрузке данных курса:', err)
        setError(
          err.response?.data?.detail || 
          err.message || 
          'Произошла ошибка при загрузке данных курса. Пожалуйста, попробуйте еще раз.'
        )
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchCourseData()
  }, [id])

  // Обработчик выбора файла - сохраняем файл в отдельное состояние
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Сохраняем файл в отдельное состояние для отправки
      setNewImageFile(selectedFile);
      
      // Обновляем отображение в форме
      setCourseData(prev => ({
        ...prev,
        image: URL.createObjectURL(selectedFile) // Для отображения превью
      }));
    }
  };

  // Функция отправки формы
  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true)
      setError(null)
      
      console.log("Отправка формы с данными:", formData);
      console.log("Есть ли новое изображение:", newImageFile ? "Да" : "Нет");
      
      // Создаем объект FormData для отправки multipart/form-data
      const formDataToSend = new FormData()
      
      // Добавляем текстовые поля
      formDataToSend.append('course_name', formData.title)
      formDataToSend.append('category_id', formData.category_id)
      
      // Если есть новое изображение из fileInput, добавляем его
      if (newImageFile) {
        console.log("Добавляем новое изображение в FormData:", newImageFile.name);
        formDataToSend.append('image', newImageFile)
      }
      // Проверяем случай, когда формат изображения неверно определяется
      else if (formData.image && !(typeof formData.image === 'string')) {
        console.log("Добавляем изображение из formData в FormData");
        formDataToSend.append('image', formData.image)
      }
      
      // Для отладки - логируем содержимое FormData
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
      }
      
      // Отправляем данные на сервер, используя id из параметров маршрута
      const result = await updateCourse(id, formDataToSend)
      console.log("Результат обновления:", result);
      
      // Перенаправляем на страницу курса
      navigate(`/courses/${id}`)
    } catch (err) {
      console.error('Ошибка при обновлении курса:', err)
      setError(
        err.response?.data?.detail || 
        err.message || 
        'Произошла ошибка при обновлении курса. Пожалуйста, попробуйте еще раз.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.contentWrapper}>
          <h1 className="page-title add-top-margin">Редактирование курса</h1>
          <div className={styles.loading}>Загрузка данных курса...</div>
        </main>
      </div>
    )
  }
  
  if (!courseData) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.contentWrapper}>
          <div className="error">Курс не найден</div>
          <button 
            className={styles.backButton}
            onClick={() => navigate('/courses')}
          >
            Вернуться к курсам
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.contentWrapper}>
        <div className={styles.content}>
          <div className={styles.pageHeader}>
            <button 
              className={styles.backButton}
              onClick={() => navigate(`/courses/${id}`)}
            >
              <FaArrowLeft /> Вернуться к курсу
            </button>
          </div>
          
          {error && (
            <div className={styles.errorAlert}>
              {error}
            </div>
          )}
          
          <div className={styles.imageWrapper}>
            <div className={styles.imageContainer}>
              {courseData.image ? (
                <>
                  <img 
                    src={typeof courseData.image === 'string' 
                      ? courseData.image 
                      : URL.createObjectURL(courseData.image)} 
                    alt="Изображение курса" 
                    className={styles.courseImage} 
                  />
                  <div className={styles.imageOverlay}>
                    <button 
                      type="button" 
                      className={styles.changeImageButton}
                      onClick={() => fileInputRef.current.click()}
                    >
                      Изменить изображение
                    </button>
                  </div>
                </>
              ) : (
                <div 
                  className={styles.placeholder}
                  onClick={() => fileInputRef.current.click()}
                >
                  <span>Добавить изображение</span>
                </div>
              )}
              
              {/* Скрытый input для выбора файла */}
              <input
                type="file"
                ref={fileInputRef}
                className={styles.fileInput}
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          </div>
          
          <CourseForm 
            initialData={courseData}
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting}
            submitButtonText="Сохранить изменения"
            hideImageUpload={true}
          />
        </div>
      </main>
    </div>
  )
}

export default EditCoursePage
