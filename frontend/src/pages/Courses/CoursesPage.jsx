import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './coursesPage.css';
import Header from '../../components/Header/Header';
import CoursesList from '../../components/CoursesList/CoursesList';

const CoursesPage = () => {
    const navigate = useNavigate();
    const [isButtonVisible, setIsButtonVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            // Показываем кнопку при скролле вверх или когда мы в самом верху страницы
            if (currentScrollY < lastScrollY || currentScrollY < 100) {
                setIsButtonVisible(true);
            } else {
                setIsButtonVisible(false);
            }
            
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [lastScrollY]);

    const handleAddCourse = () => {
        navigate('/courses/create');
    };

    return (
        <div className="courses-container">
            <Header activePage="courses" />

            <div className="content-wrapper">
                <div className="page-header">
                    <h1 className="page-title">Все курсы</h1>
                </div>

                <CoursesList />

                <div className={`add-course-container ${isButtonVisible ? 'visible' : ''}`}>
                    <button className="add-button" onClick={handleAddCourse}>
                        Добавить курс
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CoursesPage; 