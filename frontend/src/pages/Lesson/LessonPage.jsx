import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { getLessonById } from '../../services/lessonService';
import { getCourseData, getCourseLessons } from '../../services/courseService';
import styles from './LessonPage.module.css';

const LessonPage = () => {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const [lesson, setLesson] = useState(null);
    const [course, setCourse] = useState(null);
    const [courseLessons, setCourseLessons] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                // Получаем данные урока и курса параллельно
                const [lessonData, courseData, lessonsData] = await Promise.all([
                    getLessonById(lessonId),
                    getCourseData(courseId),
                    getCourseLessons(courseId)
                ]);
                
                setLesson(lessonData);
                setCourse(courseData);
                setCourseLessons(lessonsData || []);
            } catch (err) {
                console.error('Ошибка при загрузке данных:', err);
                setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchData();
    }, [courseId, lessonId]);

    // Функция для навигации к предыдущему/следующему уроку
    const navigateToLesson = (direction) => {
        if (!courseLessons || courseLessons.length === 0) return;
        
        // Сортируем уроки по их номеру
        const sortedLessons = [...courseLessons].sort((a, b) => a.lesson_num - b.lesson_num);
        
        // Находим индекс текущего урока
        const currentLessonIndex = sortedLessons.findIndex(l => l.lesson_id === parseInt(lessonId));
        
        if (currentLessonIndex === -1) return;
        
        if (direction === 'prev' && currentLessonIndex > 0) {
            // Переходим к предыдущему уроку
            navigate(`/courses/${courseId}/lessons/${sortedLessons[currentLessonIndex - 1].lesson_id}`);
        } else if (direction === 'next' && currentLessonIndex < sortedLessons.length - 1) {
            // Переходим к следующему уроку
            navigate(`/courses/${courseId}/lessons/${sortedLessons[currentLessonIndex + 1].lesson_id}`);
        }
    };

    // Проверяем возможность навигации
    const canGoToPrevious = () => {
        if (!courseLessons || courseLessons.length === 0) return false;
        
        const sortedLessons = [...courseLessons].sort((a, b) => a.lesson_num - b.lesson_num);
        const currentLessonIndex = sortedLessons.findIndex(l => l.lesson_id === parseInt(lessonId));
        
        return currentLessonIndex > 0;
    };

    const canGoToNext = () => {
        if (!courseLessons || courseLessons.length === 0) return false;
        
        const sortedLessons = [...courseLessons].sort((a, b) => a.lesson_num - b.lesson_num);
        const currentLessonIndex = sortedLessons.findIndex(l => l.lesson_id === parseInt(lessonId));
        
        return currentLessonIndex < sortedLessons.length - 1 && currentLessonIndex !== -1;
    };

    if (isLoading) {
        return (
            <div className={styles.container}>
                <Header />
                <div className={styles.loadingContainer}>
                    <div className={styles.loading}>Загрузка урока...</div>
                </div>
            </div>
        );
    }

    if (error || !lesson) {
        return (
            <div className={styles.container}>
                <Header />
                <div className={styles.errorContainer}>
                    <div className={styles.error}>
                        {error || 'Урок не найден'}
                    </div>
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
                <div className={styles.backToCourseBtnContainer}>
                    <button 
                        className={styles.backToCourseBtn}
                        onClick={() => navigate(`/courses/${courseId}`)}
                    >
                        ← Вернуться к курсу
                    </button>
                </div>

                <div className={styles.lessonHeader}>
                    <div className={styles.lessonInfo}>
                        <h1 className={styles.lessonTitle}>Урок {lesson.lesson_num}</h1>
                        {course && (
                            <div className={styles.courseInfo}>
                                <span className={styles.courseName}>{course.course_name}</span>
                                <span className={styles.courseCategory}>{course.category_name}</span>
                            </div>
                        )}
                    </div>
                    
                    {lesson.lesson_image && (
                        <div className={styles.lessonImageContainer}>
                            <img 
                                src={`${import.meta.env.VITE_API_URL || ''}/${lesson.lesson_image}`} 
                                alt={`Иллюстрация к уроку ${lesson.lesson_num}`} 
                                className={styles.lessonImage} 
                            />
                        </div>
                    )}
                </div>

                <div className={styles.lessonNavigation}>
                    <button 
                        className={styles.navButton} 
                        onClick={() => navigateToLesson('prev')}
                        disabled={!canGoToPrevious()}
                    >
                        ← Предыдущий урок
                    </button>
                    <button 
                        className={styles.navButton} 
                        onClick={() => navigateToLesson('next')}
                        disabled={!canGoToNext()}
                    >
                        Следующий урок →
                    </button>
                </div>

                <div className={styles.lessonContent}>
                    <div className={styles.lessonDescription}>
                        {lesson.description}
                    </div>
                </div>

                <div className={styles.actionsPanel}>
                    <Link 
                        to={`/courses/${courseId}/lessons/${lessonId}/edit`} 
                        className={styles.editButton}
                    >
                        Редактировать урок
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LessonPage; 