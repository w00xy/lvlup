import { useState } from 'react'
import styles from './LessonForm.module.css'

const LessonForm = ({ 
  initialData = { 
    lesson_num: '',
    description: '',
    image: null,
    course_id: '' // Будет передано из родительского компонента
  }, 
  onSubmit, 
  submitButtonText = 'Добавить урок',
  isSubmitting = false,
  readOnlyLessonNum = false, // Параметр для блокировки поля
  lessonNumInfo // Добавляем параметр для информации о номере урока
}) => {
  // Состояние формы
  const [formData, setFormData] = useState({ ...initialData })
  
  // Состояние для ошибок валидации
  const [validationErrors, setValidationErrors] = useState({
    lesson_num: '',
    description: '',
    image: '',
  })
  
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
      lesson_num: '',
      description: '',
      image: '',
    }
    let isValid = true

    // Проверка номера урока
    if (!formData.lesson_num) {
      errors.lesson_num = 'Необходимо указать номер урока'
      isValid = false
    }

    // Проверка описания (опционально)
    if (!formData.description || formData.description.trim() === '') {
      errors.description = 'Необходимо добавить описание урока'
      isValid = false
    }

    // Проверка изображения (опционально)
    if (!formData.image) {
      errors.image = 'Необходимо загрузить изображение'
      isValid = false
    }

    setValidationErrors(errors)
    return isValid
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Проверяем валидность формы перед отправкой
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.topSection}>
        <div className={styles.imageSection}>
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
        
        {lessonNumInfo && (
          <div className={styles.lessonNumInfoSection}>
            {lessonNumInfo}
          </div>
        )}
      </div>

      {/* Убираем поле ввода номера урока, если оно только для чтения */}
      {!readOnlyLessonNum && (
        <div className={styles.formElement}>
          <input
            type="number"
            name="lesson_num"
            placeholder="Номер урока"
            value={formData.lesson_num}
            onChange={handleInputChange}
            className={validationErrors.lesson_num ? `${styles.input} ${styles.inputError}` : styles.input}
            min="1"
          />
          <div className={styles.errorContainer}>
            {validationErrors.lesson_num && (
              <div className={styles.errorMessage}>{validationErrors.lesson_num}</div>
            )}
          </div>
        </div>
      )}

      <div className={styles.formElement}>
        <textarea
          name="description"
          placeholder="Описание урока"
          value={formData.description}
          onChange={handleInputChange}
          className={validationErrors.description ? `${styles.textArea} ${styles.inputError}` : styles.textArea}
          rows="10"
        ></textarea>
        <div className={styles.errorContainer}>
          {validationErrors.description && (
            <div className={styles.errorMessage}>{validationErrors.description}</div>
          )}
        </div>
      </div>

        <button 
          type="submit" 
          className="add-button self-center"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Отправка...' : submitButtonText}
        </button>
    </form>
  )
}

export default LessonForm 