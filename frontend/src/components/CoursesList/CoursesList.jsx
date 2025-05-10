import React, { useEffect, useState } from 'react';
import './coursesList.css';
import CourseCard from '../CourseCard/CourseCard';
import { useNavigate } from 'react-router-dom';
import { getCourses } from '../../services/courseService';

// Временные моки для курсов
const defaultCourses = [
    { 
        id: 1, 
        title: 'Продвижение в соц-сетях УБТ Траффик', 
        date: '5 мая 2025', 
        image: '/134a02b0ac6a07801d64d610443fe194.png',
        category: 'Маркетинг'
    },
    { 
        id: 2, 
        title: 'Продвижение в соц-сетях УБТ Траффик', 
        date: '5 мая 2025', 
        image: '/134a02b0ac6a07801d64d610443fe194.png',
        category: 'SMM'
    },
    { 
        id: 3, 
        title: 'Продвижение в соц-сетях УБТ Траффик', 
        date: '5 мая 2025', 
        image: '/134a02b0ac6a07801d64d610443fe194.png',
        category: 'Таргет'
    },
    { 
        id: 4, 
        title: 'Продвижение в соц-сетях УБТ Траффик', 
        date: '5 мая 2025', 
        image: '/134a02b0ac6a07801d64d610443fe194.png',
        category: 'Маркетинг'
    },
    { 
        id: 5, 
        title: 'Продвижение в соц-сетях УБТ Траффик', 
        date: '5 мая 2025', 
        image: '/134a02b0ac6a07801d64d610443fe194.png',
        category: 'SMM'
    },
    { 
        id: 6, 
        title: 'Продвижение в соц-сетях УБТ Траффик', 
        date: '5 мая 2025', 
        image: '/134a02b0ac6a07801d64d610443fe194.png',
        category: 'Таргет'
    },
    { 
        id: 7, 
        title: 'Продвижение в соц-сетях УБТ Траффик', 
        date: '5 мая 2025', 
        image: '/134a02b0ac6a07801d64d610443fe194.png',
        category: 'Маркетинг'
    },
];

const CoursesList = () => {
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const courses = await getCourses();
                console.log(courses);
                setCourses(courses);
            } catch (error) {
                console.error('Ошибка при загрузке курсов:', error);
            }
        };
        fetchCourses();
    }, []);

    const navigate = useNavigate();
    const handleCardClick = (id) => {
        navigate(`/courses/${id}`);
    };
    return (
        <div className="courses-list-container">
            <div className="courses-list">
                {courses.map(course => (
                    <CourseCard
                        key={course.course_id}
                        id={course.course_id}
                        title={course.course_name}
                        date={course.start_date}
                        image={course.course_image}
                        category={course.category_name}
                        onClick={() => handleCardClick(course.course_id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default CoursesList; 