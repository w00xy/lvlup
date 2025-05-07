import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header/Header'
import styles from './CreateCoursePage.module.css'

const CreateCoursePage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    startDate: '',
    image: null
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    setFormData(prev => ({
      ...prev,
      image: file
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Здесь будет логика отправки данных на бэкенд
    console.log('Form data:', formData)
    navigate('/courses')
  }

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>Создание курса</h1>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.imageUpload}>
            {formData.image ? (
              <img 
                src={URL.createObjectURL(formData.image)} 
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

          <input
            type="text"
            name="title"
            placeholder="Название"
            value={formData.title}
            onChange={handleInputChange}
            className={styles.input}
          />

          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className={styles.select}
          >
            <option value="">Категория</option>
            <option value="programming">Программирование</option>
            <option value="design">Дизайн</option>
            <option value="marketing">Маркетинг</option>
            <option value="business">Бизнес</option>
          </select>

          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            className={styles.input}
          />

          <button type="submit" className={styles.button}>
            Добавить курс
          </button>
        </form>
      </main>
    </div>
  )
}

export default CreateCoursePage 