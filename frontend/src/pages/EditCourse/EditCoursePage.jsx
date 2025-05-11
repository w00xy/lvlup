import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import styles from './EditCoursePage.module.css';

const EditCoursePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        course_name: '',
        category_id: '',
        start_date: '',
        end_date: '',
        image: null
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                // Загружаем данные курса
                const courseResponse = await fetch(`/api/courses/${id}`);
                const courseContentType = courseResponse.headers.get("content-type");
                
                if (!courseResponse.ok) {
                    const errorData = courseContentType?.includes("application/json") 
                        ? await courseResponse.json() 
                        : { detail: await courseResponse.text() };
                    throw new Error(errorData.detail || 'Не удалось загрузить данные курса');
                }

                if (!courseContentType?.includes("application/json")) {
                    throw new Error('Неверный формат ответа от сервера');
                }

                const courseData = await courseResponse.json();

                // Загружаем список категорий
                const categoriesResponse = await fetch('/api/categories');
                const categoriesData = await categoriesResponse.json();
                setCategories(categoriesData);

                // Форматируем дату для input type="date"
                const formatDate = (dateString) => {
                    if (!dateString) return '';
                    const date = new Date(dateString);
                    return date.toISOString().split('T')[0];
                };

                setFormData({
                    course_name: courseData.course_name || '',
                    category_id: courseData.category_id || '',
                    start_date: formatDate(courseData.start_date),
                    end_date: formatDate(courseData.end_date),
                    image: courseData.course_image || null
                });
            } catch (error) {
                console.error('Error fetching course data:', error);
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                image: file
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const formDataToSend = new FormData();
            if (formData.course_name) formDataToSend.append('course_name', formData.course_name);
            if (formData.category_id) formDataToSend.append('category_id', formData.category_id);
            if (formData.start_date) formDataToSend.append('start_date', formData.start_date);
            if (formData.end_date) formDataToSend.append('end_date', formData.end_date);
            if (formData.image instanceof File) {
                formDataToSend.append('image', formData.image);
            }

            const response = await fetch(`/api/courses/${id}`, {
                method: 'PUT',
                body: formDataToSend,
                credentials: 'include'
            });

            const contentType = response.headers.get("content-type");

            if (!response.ok) {
                const errorData = contentType?.includes("application/json") 
                    ? await response.json() 
                    : { detail: await response.text() };
                throw new Error(errorData.detail || 'Не удалось обновить курс');
            }

            if (!contentType?.includes("application/json")) {
                throw new Error('Неверный формат ответа от сервера');
            }

            navigate(`/courses/${id}`);
        } catch (error) {
            console.error('Error updating course:', error);
            setError(error.message);
        }
    };

    if (isLoading) {
        return (
            <div className={styles.container}>
                <Header />
                <div className={styles.contentWrapper}>
                    <div className={styles.loading}>Загрузка...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <Header />
                <div className={styles.contentWrapper}>
                    <div className={styles.error}>{error}</div>
                    <button 
                        className={styles.backButton} 
                        onClick={() => navigate(`/courses/${id}`)}
                    >
                        Вернуться к курсу
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Header />
            <div className={styles.contentWrapper}>
                <h1 className={styles.title}>Редактирование курса</h1>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.imageUpload}>
                        {formData.image ? (
                            <img 
                                src={formData.image instanceof File ? URL.createObjectURL(formData.image) : formData.image} 
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
                        name="course_name"
                        placeholder="Название курса"
                        value={formData.course_name}
                        onChange={handleInputChange}
                        className={styles.input}
                    />

                    <select
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleInputChange}
                        className={styles.select}
                    >
                        <option value="">Выберите категорию</option>
                        {categories.map(category => (
                            <option key={category.category_id} value={category.category_id}>
                                {category.category_name}
                            </option>
                        ))}
                    </select>

                    <div className={styles.dateInputs}>
                        <div className={styles.dateField}>
                            <label>Дата начала:</label>
                            <input
                                type="date"
                                name="start_date"
                                value={formData.start_date}
                                onChange={handleInputChange}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.dateField}>
                            <label>Дата окончания:</label>
                            <input
                                type="date"
                                name="end_date"
                                value={formData.end_date}
                                onChange={handleInputChange}
                                className={styles.input}
                            />
                        </div>
                    </div>

                    <div className={styles.buttonContainer}>
                        <button type="submit" className={styles.submitButton}>
                            Сохранить изменения
                        </button>
                        <button 
                            type="button" 
                            className={styles.backButton}
                            onClick={() => navigate(`/courses/${id}`)}
                        >
                            Вернуться к курсу
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCoursePage; 