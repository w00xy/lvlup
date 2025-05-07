import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import styles from './CoursePage.module.css';

const mockLessons = [
    { id: 1, title: 'Урок 1', desc: 'Как создавать переменные', image: '/134a02b0ac6a07801d64d610443fe194.png' },
    { id: 2, title: 'Урок 2', desc: 'Как создавать переменные', image: '/134a02b0ac6a07801d64d610443fe194.png' },
    { id: 3, title: 'Урок 3', desc: 'Как создавать переменные', image: '/134a02b0ac6a07801d64d610443fe194.png' },
    { id: 4, title: 'Урок 4', desc: 'Как создавать переменные', image: '/134a02b0ac6a07801d64d610443fe194.png' },
    { id: 5, title: 'Урок 5', desc: 'Как создавать переменные', image: '/134a02b0ac6a07801d64d610443fe194.png' },
    { id: 6, title: 'Урок 6', desc: 'Как создавать переменные', image: '/134a02b0ac6a07801d64d610443fe194.png' },
];

const CoursePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const handleLessonClick = (lessonId) => {
        navigate(`/courses/${id}/lessons/${lessonId}`);
    };

    return (
        <div className={styles.container}>
            <Header />
            <div className={styles.contentWrapper}>
                <div className={styles.header}>
                    <div className={styles.info}>
                        <img src="/134a02b0ac6a07801d64d610443fe194.png" alt="Course" className={styles.courseImage} />
                        <div className={styles.details}>
                            <h1 className={styles.title}>Курс Python</h1>
                            <div className={styles.meta}>
                                <span>Категория: Программирование</span>
                                <span>Начало:</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.lessonsGrid}>
                    {mockLessons.map(lesson => (
                        <div key={lesson.id} className={styles.lessonCard} onClick={() => handleLessonClick(lesson.id)}>
                            <img src={lesson.image} alt={lesson.title} className={styles.lessonImage} />
                            <div className={styles.lessonInfo}>
                                <h3 className={styles.lessonTitle}>{lesson.title}</h3>
                                <p className={styles.lessonDesc}>{lesson.desc}</p>
                            </div>
                            <div className={styles.lessonMore}>•••</div>
                        </div>
                    ))}
                </div>

                <button className={styles.addButton}>
                    Добавить урок
                </button>
            </div>
        </div>
    );
};

export default CoursePage; 