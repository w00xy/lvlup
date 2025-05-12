import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { getCourseData, getCourseLessons } from '../../services/courseService';
import { FaEdit } from 'react-icons/fa';
import styles from './CoursePage.module.css';

const CoursePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                // Получаем данные курса
                const courseData = await getCourseData(id);
                setCourse(courseData);
                
                // Получаем уроки курса
                const lessonsData = await getCourseLessons(id);
                setLessons(lessonsData);
            } catch (err) {
                console.error('Ошибка при загрузке курса:', err);
                setError('Не удалось загрузить данные курса. Пожалуйста, попробуйте позже.');
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchCourseData();
    }, [id]);

    const handleLessonClick = (lessonId) => {
        navigate(`/courses/${id}/lessons/${lessonId}`);
    };

    const handleAddLesson = () => {
        navigate(`/courses/${id}/lessons/create`);
    };

    const handleEditCourse = () => {
        navigate(`/courses/${id}/edit`);
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
                        className={styles.retryButton}
                        onClick={() => window.location.reload()}
                    >
                        Попробовать снова
                    </button>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className={styles.container}>
                <Header />
                <div className={styles.contentWrapper}>
                    <div className={styles.error}>Курс не найден</div>
                    <button 
                        className={styles.backButton}
                        onClick={() => navigate('/courses')}
                    >
                        Вернуться к списку курсов
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Header />
            <div className={styles.contentWrapper}>
                <div className={styles.header}>
                    <div className={styles.info}>
                        <img 
                            src={course.course_image ? `${import.meta.env.VITE_API_URL}/${course.course_image}` : "/placeholder-course.png"} 
                            alt={course.course_name} 
                            className={styles.courseImage} 
                        />
                        <div className={styles.details}>
                            <div className={styles.titleRow}>
                                <h1 className={styles.title}>{course.course_name}</h1>
                                <button 
                                    className={styles.editButton}
                                    onClick={handleEditCourse}
                                    title="Редактировать курс"
                                >
                                    <FaEdit />
                                </button>
                            </div>
                            <div className={styles.meta}>
                                <span>Категория: {course.category_name}</span>
                                <span>Начало: {new Date(course.start_date).toLocaleDateString()}</span>
                                {course.end_date && (
                                    <span>Окончание: {new Date(course.end_date).toLocaleDateString()}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {lessons.length > 0 ? (
                    <div className={styles.lessonsGrid}>
                        {lessons.map(lesson => (
                            <div 
                                key={lesson.lesson_id} 
                                className={styles.lessonCard} 
                                onClick={() => handleLessonClick(lesson.lesson_id)}
                            >
                                <img 
                                    src={lesson.lesson_image ? `${import.meta.env.VITE_API_URL}/${lesson.lesson_image}` : "/placeholder-lesson.png"}
                                    alt={lesson.title} 
                                    className={styles.lessonImage} 
                                />
                                <div className={styles.lessonInfo}>
                                    <h3 className={styles.lessonTitle}>Урок {lesson.lesson_num}</h3>
                                    <p className={styles.lessonDesc}>{lesson.description || 'Нет описания'}</p>
                                </div>
                                <div className={styles.lessonMore}>•••</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.noLessons}>
                        <p>У этого курса пока нет уроков</p>
                    </div>
                )}

                <button className="add-button self-center" onClick={handleAddLesson}>
                    Добавить урок
                </button>
            </div>
        </div>
    );
};

export default CoursePage; 