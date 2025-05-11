import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import styles from './EditLessonPage.module.css';

const EditLessonPage = () => {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: null,
        lesson_num: null
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLessonData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/lessons/${lessonId}`);
                const contentType = response.headers.get("content-type");
                
                if (!response.ok) {
                    const errorData = contentType?.includes("application/json") 
                        ? await response.json() 
                        : { detail: await response.text() };
                    throw new Error(errorData.detail || 'Не удалось загрузить данные урока');
                }

                if (!contentType?.includes("application/json")) {
                    throw new Error('Неверный формат ответа от сервера');
                }

                const data = await response.json();
                setFormData({
                    title: data.title || '',
                    description: data.description || '',
                    image: data.lesson_image || null,
                    lesson_num: data.lesson_num || null
                });
            } catch (error) {
                console.error('Error fetching lesson data:', error);
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLessonData();
    }, [lessonId]);

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
            if (formData.title) formDataToSend.append('title', formData.title);
            if (formData.description) formDataToSend.append('description', formData.description);
            if (formData.lesson_num) formDataToSend.append('lesson_num', formData.lesson_num);
            if (formData.image instanceof File) {
                formDataToSend.append('image', formData.image);
            }

            const response = await fetch(`/api/lessons/${lessonId}`, {
                method: 'PUT',
                body: formDataToSend,
                credentials: 'include'
            });

            const contentType = response.headers.get("content-type");

            if (!response.ok) {
                const errorData = contentType?.includes("application/json") 
                    ? await response.json() 
                    : { detail: await response.text() };
                throw new Error(errorData.detail || 'Не удалось обновить урок');
            }

            if (!contentType?.includes("application/json")) {
                throw new Error('Неверный формат ответа от сервера');
            }

            navigate(`/courses/${courseId}`);
        } catch (error) {
            console.error('Error updating lesson:', error);
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
                        onClick={() => navigate(`/courses/${courseId}`)}
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
                <h1 className={styles.title}>Редактирование урока</h1>
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
                        name="title"
                        placeholder="Название"
                        value={formData.title}
                        onChange={handleInputChange}
                        className={styles.input}
                    />

                    <textarea
                        name="description"
                        placeholder="Описание"
                        value={formData.description}
                        onChange={handleInputChange}
                        className={styles.textarea}
                    />

                    <div className={styles.buttonContainer}>
                        <button type="submit" className={styles.submitButton}>
                            Отредактировать урок
                        </button>
                        <button 
                            type="button" 
                            className={styles.backButton}
                            onClick={() => navigate(`/courses/${courseId}`)}
                        >
                            Вернуться к курсу
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditLessonPage; 