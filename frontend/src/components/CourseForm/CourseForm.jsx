import { useState, useEffect } from 'react'
import { getCategories } from '../../services/categoryService'
import styles from './CourseForm.module.css'

// Функция для получения текущей даты и времени в МСК (UTC+3)
const getMoscowDateTime = () => {
  // Создаем объект даты
  const now = new Date();
  
  // Добавляем смещение для UTC+3 (московское время)
  // Получаем текущее смещение в минутах и вычитаем его,
  // затем добавляем 3 часа (180 минут) для МСК
  const moscowOffset = 180; // UTC+3 в минутах
  const localOffset = now.getTimezoneOffset();
  const totalOffsetMinutes = localOffset + moscowOffset;
  
  // Создаем новую дату с учетом смещения для МСК
  const moscowTime = new Date(now.getTime() + totalOffsetMinutes * 60000);
  
  return moscowTime.toISOString();
};

// Функция для получения только даты МСК
const getMoscowDate = () => {
  const moscowDateTime = getMoscowDateTime();
  return moscowDateTime.slice(0, 10); // "YYYY-MM-DD"
};

const CourseForm = ({ 
  initialData = { 
    title: '', 
    category_id: '',
    startDate: getMoscowDate(), // Используем московскую дату по умолчанию
    image: null 
  }, 
  onSubmit, 
  submitButtonText = 'Добавить курс',
  isSubmitting = false 
}) => {
  // Вместо зависимости от initialData в useEffect, используем ключ
  const [formData, setFormData] = useState({ ...initialData })
  const [today] = useState(getMoscowDate()) // Сохраняем сегодняшнюю дату МСК для ограничений
  
  // Состояния для категорий и загрузки
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Состояние для ошибок валидации
  const [validationErrors, setValidationErrors] = useState({
    title: '',
    category_id: '',
    startDate: '',
    image: '',
  })
  
  // Загружаем категории при монтировании компонента
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        const data = await getCategories()
        setCategories(data)
        setError(null)
      } catch (err) {
        setError('Ошибка при загрузке категорий')
        console.error('Ошибка при загрузке категорий:', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchCategories()
  }, [])
  
  // Обработчик изменения полей формы
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Сбрасываем ошибку валидации при изменении поля
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    setFormData(prev => ({
      ...prev,
      image: file
    }))
    
    // Сбрасываем ошибку валидации при изменении изображения
    if (validationErrors.image) {
      setValidationErrors(prev => ({
        ...prev,
        image: ''
      }))
    }
  }

  const validateForm = () => {
    const errors = {
      title: '',
      category_id: '',
      startDate: '',
      image: '',
    }
    let isValid = true

    // Проверка заголовка
    if (!formData.title || formData.title.trim() === '') {
      errors.title = 'Необходимо указать название курса'
      isValid = false
    }

    // Проверка категории
    if (!formData.category_id) {
      errors.category_id = 'Необходимо выбрать категорию'
      isValid = false
    }

    // Проверка даты
    if (!formData.startDate) {
      errors.startDate = 'Необходимо указать дату начала'
      isValid = false
    }

    // Проверка изображения (опционально, можно убрать если изображение не обязательно)
    if (!formData.image) {
      errors.image = 'Необходимо загрузить изображение'
      isValid = false
    }

    setValidationErrors(errors)
    return isValid
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const dataToSubmit = { ...formData };
      
      if (dataToSubmit.startDate) {
        // Создаем объект Date с выбранной датой
        const localDate = new Date(dataToSubmit.startDate);
        const localNow = new Date();
        
        // Устанавливаем текущее локальное время
        localDate.setHours(localNow.getHours());
        localDate.setMinutes(localNow.getMinutes());
        localDate.setSeconds(localNow.getSeconds());
        
        // Форматируем дату в строку YYY-MM-DD
        const year = localDate.getFullYear();
        const month = String(localDate.getMonth() + 1).padStart(2, '0');
        const day = String(localDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        // Форматируем время в строку HH:MM:SS
        const hours = String(localDate.getHours()).padStart(2, '0');
        const minutes = String(localDate.getMinutes()).padStart(2, '0');
        const seconds = String(localDate.getSeconds()).padStart(2, '0');
        const timeStr = `${hours}:${minutes}:${seconds}`;
        
        // Комбинируем дату и время с явным указанием, что это локальное время
        dataToSubmit.startDate = `${dateStr}T${timeStr}`;
      }
      
      onSubmit(dataToSubmit);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formElement}>
        <div className={styles.imageUpload}>
          {formData.image ? (
            <img 
              src={typeof formData.image === 'string' 
                ? formData.image 
                : URL.createObjectURL(formData.image)} 
              alt="Preview" 
              className={styles.preview}
            />
          ) : (
            <div className={styles.placeholder}>
              <span>Фото</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={styles.fileInput}
              />
            </div>
          )}
        </div>
        <div className={styles.errorContainer}>
          {validationErrors.image && (
            <div className={styles.imageErrorMessage}>{validationErrors.image}</div>
          )}
        </div>
      </div>

      <div className={styles.formElement}>
        <input
          type="text"
          name="title"
          placeholder="Название"
          value={formData.title || ''}
          onChange={handleInputChange}
          className={validationErrors.title ? `${styles.input} ${styles.inputError}` : styles.input}
        />
        <div className={styles.errorContainer}>
          {validationErrors.title && (
            <div className={styles.errorMessage}>{validationErrors.title}</div>
          )}
        </div>
      </div>

      <div className={styles.formElement}>
        <select
          name="category_id"
          value={formData.category_id || ''}
          onChange={handleInputChange}
          className={validationErrors.category_id ? `${styles.select} ${styles.inputError}` : styles.select}
          disabled={isLoading}
        >
          <option value="">Выберите категорию</option>
          {isLoading ? (
            <option disabled>Загрузка категорий...</option>
          ) : error ? (
            <option disabled>Ошибка загрузки</option>
          ) : (
            categories.map(category => (
              <option key={category.category_id} value={category.category_id}>
                {category.name}
              </option>
            ))
          )}
        </select>
        <div className={styles.errorContainer}>
          {validationErrors.category_id && (
            <div className={styles.errorMessage}>{validationErrors.category_id}</div>
          )}
        </div>
      </div>

      <div className={styles.formElement}>
        <div className={styles.datePickerContainer}>
          <input
            type="date"
            name="startDate"
            value={formData.startDate || today}
            onChange={handleInputChange}
            max={today} // Ограничиваем выбор даты сегодняшним днем
            className={validationErrors.startDate ? `${styles.input} ${styles.dateInput} ${styles.inputError}` : `${styles.input} ${styles.dateInput}`}
          />
          <div className={styles.dateIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
        </div>
        <div className={styles.errorContainer}>
          {validationErrors.startDate && (
            <div className={styles.errorMessage}>{validationErrors.startDate}</div>
          )}
        </div>
      </div>

      <button type="submit" className="add-button">
        {submitButtonText}
      </button>
    </form>
  )
}

export default CourseForm 